const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'offline.html'), 'utf8');
const inlineScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const pageScript = inlineScripts.at(-1)[1];

function createElement() {
  const listeners = new Map();
  const attributes = new Map();
  const classes = new Set();

  return {
    value: '',
    href: '',
    attributes,
    listeners,
    classList: {
      toggle(name, force) {
        if (force) classes.add(name);
        else classes.delete(name);
      },
      contains(name) {
        return classes.has(name);
      },
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    removeAttribute(name) {
      attributes.delete(name);
    },
    addEventListener(name, handler) {
      listeners.set(name, handler);
    },
    focus() {},
    select() {},
  };
}

function loadPage(buildWebvpnUrl) {
  const elements = {
    'generator-form': createElement(),
    'target-url': createElement(),
    'result-url': createElement(),
    copy: createElement(),
    open: createElement(),
    status: createElement(),
  };
  const windowListeners = new Map();
  const cryptoJs = { marker: 'crypto-js' };
  const context = {
    window: {
      CryptoJS: cryptoJs,
      WebvpnUrl: { buildWebvpnUrl },
      addEventListener(name, handler) {
        windowListeners.set(name, handler);
      },
    },
    document: {
      getElementById(id) {
        return elements[id];
      },
    },
    navigator: { clipboard: { writeText: async () => {} } },
    Error,
  };

  vm.runInNewContext(pageScript, context);
  windowListeners.get('DOMContentLoaded')();

  return { cryptoJs, elements };
}

test('offline helper loads the reusable core and generates JWTS by default', () => {
  assert.match(html, /src="\.\/webvpn-core\.js"/);
  assert.match(html, /crypto-js\/4\.1\.1\/crypto-js\.min\.js/);

  const calls = [];
  const { cryptoJs, elements } = loadPage((source, passedCryptoJs) => {
    calls.push({ source, passedCryptoJs });
    return 'https://webvpn.hitwh.edu.cn/http/new-jwts-route/';
  });

  assert.deepEqual(calls, [
    { source: 'http://jwts.hitwh.edu.cn/', passedCryptoJs: cryptoJs },
  ]);
  assert.equal(
    elements['result-url'].value,
    'https://webvpn.hitwh.edu.cn/http/new-jwts-route/',
  );
  assert.equal(
    elements.open.href,
    'https://webvpn.hitwh.edu.cn/http/new-jwts-route/',
  );
  assert.equal(elements.open.attributes.get('aria-disabled'), 'false');
});

test('offline helper passes a JWTS download URL through the core on submit', () => {
  const calls = [];
  const { elements } = loadPage((source) => {
    calls.push(source);
    return 'https://webvpn.hitwh.edu.cn/http/generated' + calls.length;
  });

  elements['target-url'].value =
    'http://jwts.hitwh.edu.cn/files/course-schedule.pdf?download=1#preview';
  let prevented = false;
  elements['generator-form'].listeners.get('submit')({
    preventDefault() {
      prevented = true;
    },
  });

  assert.equal(prevented, true);
  assert.deepEqual(calls, [
    'http://jwts.hitwh.edu.cn/',
    'http://jwts.hitwh.edu.cn/files/course-schedule.pdf?download=1#preview',
  ]);
  assert.equal(
    elements['result-url'].value,
    'https://webvpn.hitwh.edu.cn/http/generated2',
  );
});
