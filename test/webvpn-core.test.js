const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const test = require('node:test');

let WebvpnUrl;
try {
  WebvpnUrl = require('../webvpn-core.js');
} catch {
  WebvpnUrl = null;
}

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
        return { ciphertext: { toString: () => ciphertext.toString('hex') } };
      },
    },
    mode: { CFB: Symbol('CFB') },
    pad: { NoPadding: Symbol('NoPadding') },
  };
}

function requireWebvpnUrl() {
  assert.ok(WebvpnUrl, 'the offline WebVPN URL core module must be available');
  return WebvpnUrl;
}

test('builds the new teaching system WebVPN URL', () => {
  const result = requireWebvpnUrl().buildWebvpnUrl(
    'http://jwts.hitwh.edu.cn/',
    createCryptoJs(),
  );

  assert.equal(
    result,
    'https://webvpn.hitwh.edu.cn/http/' +
      '77726476706e69737468656265737421fae0558f693861446900c7a99c406d3667/',
  );
});

test('keeps a new teaching system download path and query intact', () => {
  const result = requireWebvpnUrl().buildWebvpnUrl(
    'http://jwts.hitwh.edu.cn/files/course-schedule.pdf?download=1#preview',
    createCryptoJs(),
  );

  assert.equal(
    result,
    'https://webvpn.hitwh.edu.cn/http/' +
      '77726476706e69737468656265737421fae0558f693861446900c7a99c406d3667' +
      '/files/course-schedule.pdf?download=1#preview',
  );
});

test('rejects hit.edu.cn from the offline helper core', () => {
  assert.throws(
    () => requireWebvpnUrl().buildWebvpnUrl(
      'https://labsafe.hit.edu.cn/',
      createCryptoJs(),
    ),
    /仅支持 IP 地址和 hitwh\.edu\.cn 域名/,
  );
});
