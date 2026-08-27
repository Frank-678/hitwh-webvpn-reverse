(() => {
  const DEFAULT_TARGET = 'http://10.245.146.27:8008/';
  const WEBVPN_ORIGIN = 'https://webvpn.hitwh.edu.cn';
  const KEY_AND_IV = 'wrdvpnisthebest!';
  const CRYPTO_JS_URL =
    'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js';

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

  function isHitwhHostname(hostname) {
    return hostname === 'hitwh.edu.cn' || hostname.endsWith('.hitwh.edu.cn');
  }

  function assertSupportedHostname(hostname) {
    if (!isIpv4(hostname) && !isHitwhHostname(hostname)) {
      throw new TypeError('仅支持 IPv4 地址和 hitwh.edu.cn 域名。');
    }
  }

  function parseTarget(source) {
    const value = source.trim();
    if (!value) {
      throw new TypeError('目标地址不能为空。');
    }

    if (/^[a-z][a-z\d+.-]*:\/\//i.test(value)) {
      return new URL(value);
    }

    const protocolInput = window.prompt(
      '未指定协议。请输入 http 或 https：',
      'http',
    );
    if (protocolInput === null) return null;

    const protocol = protocolInput.trim().toLowerCase().replace(/:$/, '');
    if (!['http', 'https'].includes(protocol)) {
      throw new TypeError('协议只能是 http 或 https。');
    }

    return new URL(protocol + '://' + value);
  }

  const source = window.prompt(
    '请输入校内地址（可粘贴完整 URL，也可只输入域名或 IP）',
    DEFAULT_TARGET,
  );
  if (source === null) return;

  let target;
  try {
    target = parseTarget(source);
    if (target === null) return;

    if (!/^https?:$/.test(target.protocol)) {
      throw new TypeError('只支持 HTTP(S) 地址。');
    }
    if (target.username || target.password) {
      throw new TypeError('目标地址不能包含用户名或密码。');
    }
    assertSupportedHostname(target.hostname);
  } catch (error) {
    const message = error instanceof Error ? error.message : '目标地址无效。';
    console.error('[WebVPN URL Generator]', error);
    window.alert('无法生成 WebVPN 链接：' + message);
    return;
  }

  const script = document.createElement('script');
  script.src = CRYPTO_JS_URL;
  script.onload = () => {
    const key = CryptoJS.enc.Utf8.parse(KEY_AND_IV);
    const iv = CryptoJS.enc.Utf8.parse(KEY_AND_IV);
    const encrypted = CryptoJS.AES.encrypt(target.hostname, key, {
      iv,
      mode: CryptoJS.mode.CFB,
      padding: CryptoJS.pad.NoPadding,
    });
    const encryptedHost =
      CryptoJS.enc.Hex.stringify(iv) + encrypted.ciphertext.toString();
    const route =
      target.protocol.slice(0, -1) + (target.port ? '-' + target.port : '');
    const finalUrl =
      WEBVPN_ORIGIN +
      '/' +
      route +
      '/' +
      encryptedHost +
      target.pathname +
      target.search +
      target.hash;

    console.log('✅ WebVPN 链接已生成：', finalUrl);
    window.location.assign(finalUrl);
  };
  script.onerror = () => {
    window.alert('无法加载加密库，请检查网络后重试。');
  };
  document.head.appendChild(script);
})();
