const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const CALC_SOURCE = fs.readFileSync(
  path.join(__dirname, '..', 'calc.js'),
  'utf8',
);
const WEBVPN_ORIGIN = 'https://webvpn.hitwh.edu.cn';
const KEY_AND_IV = 'wrdvpnisthebest!';

function createCryptoJs() {
  return {
    enc: {
      Utf8: { parse: (value) => Buffer.from(value, 'utf8') },
      Hex: { stringify: (value) => Buffer.from(value).toString('hex') },
    },
    AES: {
      encrypt: (value, key, { iv }) => {
        const cipher = crypto.createCipheriv('aes-128-cfb', key, iv);
        const ciphertext = Buffer.concat([
          cipher.update(Buffer.from(value, 'utf8')),
          cipher.final(),
        ]);
        return {
          ciphertext: { toString: () => ciphertext.toString('hex') },
        };
      },
    },
    mode: { CFB: Symbol('CFB') },
    pad: { NoPadding: Symbol('NoPadding') },
  };
}

function expectedUrl(target) {
  const parsed = new URL(target);
  const key = Buffer.from(KEY_AND_IV, 'utf8');
  const cipher = crypto.createCipheriv('aes-128-cfb', key, key);
  const ciphertext = Buffer.concat([
    cipher.update(Buffer.from(parsed.hostname, 'utf8')),
    cipher.final(),
  ]).toString('hex');
  const route = parsed.protocol.slice(0, -1) +
    (parsed.port ? '-' + parsed.port : '');
  return WEBVPN_ORIGIN + '/' + route + '/' + key.toString('hex') +
    ciphertext + parsed.pathname + parsed.search + parsed.hash;
}

function runBookmarklet(promptValues) {
  const prompts = [...promptValues];
  const alerts = [];
  const assigned = [];
  const scripts = [];
  const context = {
    URL,
    Buffer,
    CryptoJS: createCryptoJs(),
    console: { error() {}, log() {} },
    window: {
      alert: (message) => alerts.push(message),
      location: { assign: (url) => assigned.push(url),
      },
      prompt: () => prompts.shift() ?? null,
    },
    document: {
      createElement: () => ({ onerror: null, onload: null, src: '' }),
      head: {
        appendChild: (script) => {
          scripts.push(script);
          script.onload();
        },
      },
    },
  };

  vm.runInNewContext(CALC_SOURCE, context);
  return { alerts, assigned, scripts };
}

test('keeps the official IPv4 + port route unchanged', () => {
  const result = runBookmarklet(['http://10.245.146.27:8008/']);
  assert.deepEqual(result.alerts, []);
  assert.deepEqual(result.assigned, [
    'https://webvpn.hitwh.edu.cn/http-8008/' +
      '77726476706e69737468656265737421a1a70fce736526012a5ec7fecf/',
  ]);
});

test('supports a known HITWH service', () => {
  const input = 'http://jwts.hitwh.edu.cn/';
  const result = runBookmarklet([input]);
  assert.deepEqual(result.alerts, []);
  assert.deepEqual(result.assigned, [expectedUrl(input)]);
});

test('preserves a known HITWH service path', () => {
  const input = 'http://cwoa.hitwh.edu.cn/gzoa/';
  const result = runBookmarklet([input]);
  assert.deepEqual(result.alerts, []);
  assert.deepEqual(result.assigned, [expectedUrl(input)]);
});

test('converts a valid IPv6 literal', () => {
  const input = 'http://[2001:db8::1]:8443/portal?from=webvpn';
  const result = runBookmarklet([input]);
  assert.deepEqual(result.alerts, []);
  assert.deepEqual(result.assigned, [expectedUrl(input)]);
});

test('accepts IPv4 resources shown in the screenshots', () => {
  const addresses = [
    '10.245.146.27:8008',
    '10.245.130.178',
    '10.245.130.79',
    '172.26.24.11',
    '172.26.64.9',
    '172.26.64.16',
    '192.168.43.161',
    '222.194.14.94',
    '222.194.15.1',
    '222.194.15.155',
  ];

  for (const address of addresses) {
    const input = 'http://' + address + '/';
    const result = runBookmarklet([input]);
    assert.deepEqual(result.alerts, [], input);
    assert.deepEqual(result.assigned, [expectedUrl(input)], input);
  }
});

test('accepts HITWH resources shown in the screenshots', () => {
  const hostnames = [
    'hitwh.edu.cn',
    'www.hitwh.edu.cn',
    'ndkh.hitwh.edu.cn',
    'szsj.hitwh.edu.cn',
    'yjsgl.hitwh.edu.cn',
    'lib.hitwh.edu.cn',
    'cwoa.hitwh.edu.cn',
    'cwcx.hitwh.edu.cn',
    'jwts.hitwh.edu.cn',
  ];

  for (const hostname of hostnames) {
    const input = 'http://' + hostname + '/';
    const result = runBookmarklet([input]);
    assert.deepEqual(result.alerts, [], input);
    assert.deepEqual(result.assigned, [expectedUrl(input)], input);
  }
});

test('rejects hit.edu.cn before loading CryptoJS', () => {
  const result = runBookmarklet(['https://labsafe.hit.edu.cn/']);
  assert.equal(result.scripts.length, 0);
  assert.deepEqual(result.assigned, []);
  assert.match(result.alerts[0], /仅支持 IP 地址和 hitwh\.edu\.cn 域名/);
});

test('rejects other domains before loading CryptoJS', () => {
  const result = runBookmarklet(['https://example.com/']);
  assert.equal(result.scripts.length, 0);
  assert.deepEqual(result.assigned, []);
  assert.match(result.alerts[0], /仅支持 IP 地址和 hitwh\.edu\.cn 域名/);
});

test('rejects a malformed IPv4 address before loading CryptoJS', () => {
  const result = runBookmarklet(['http://999.245.146.27/']);
  assert.equal(result.scripts.length, 0);
  assert.deepEqual(result.assigned, []);
  assert.match(result.alerts[0], /目标地址无效/);
});
