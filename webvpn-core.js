(function (root, factory) {
  const api = factory();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.WebvpnUrl = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const WEBVPN_ORIGIN = 'https://webvpn.hitwh.edu.cn';
  const KEY_AND_IV = 'wrdvpnisthebest!';
  const DEFAULT_JWTS_URL = 'http://jwts.hitwh.edu.cn/';

  function isIpv4(hostname) {
    const parts = hostname.split('.');
    return (
      parts.length === 4 &&
      parts.every((part) => {
        if (!/^\d+$/.test(part)) return false;
        const value = Number(part);
        return value >= 0 && value <= 255;
      })
    );
  }

  function isIpv6(hostname) {
    return /^\[[\da-f:.]+\]$/i.test(hostname);
  }

  function isHitwhHostname(hostname) {
    return hostname === 'hitwh.edu.cn' || hostname.endsWith('.hitwh.edu.cn');
  }

  function assertSupportedHostname(hostname) {
    if (!isIpv4(hostname) && !isIpv6(hostname) && !isHitwhHostname(hostname)) {
      throw new TypeError('仅支持 IP 地址和 hitwh.edu.cn 域名。');
    }
  }

  function buildWebvpnUrl(source, cryptoJs) {
    if (typeof source !== 'string' || !source.trim()) {
      throw new TypeError('目标地址不能为空。');
    }
    if (!cryptoJs || !cryptoJs.AES || !cryptoJs.enc) {
      throw new TypeError('加密库未加载。');
    }

    const target = new URL(source.trim());
    if (!/^https?:$/.test(target.protocol)) {
      throw new TypeError('只支持 HTTP(S) 地址。');
    }
    if (target.username || target.password) {
      throw new TypeError('目标地址不能包含用户名或密码。');
    }
    assertSupportedHostname(target.hostname);

    const key = cryptoJs.enc.Utf8.parse(KEY_AND_IV);
    const iv = cryptoJs.enc.Utf8.parse(KEY_AND_IV);
    const encrypted = cryptoJs.AES.encrypt(target.hostname, key, {
      iv,
      mode: cryptoJs.mode.CFB,
      padding: cryptoJs.pad.NoPadding,
    });
    const encryptedHost =
      cryptoJs.enc.Hex.stringify(iv) + encrypted.ciphertext.toString();
    const route =
      target.protocol.slice(0, -1) + (target.port ? '-' + target.port : '');

    return (
      WEBVPN_ORIGIN +
      '/' +
      route +
      '/' +
      encryptedHost +
      target.pathname +
      target.search +
      target.hash
    );
  }

  return { DEFAULT_JWTS_URL, buildWebvpnUrl };
});
