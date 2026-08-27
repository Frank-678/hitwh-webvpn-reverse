(() => {
  const DEFAULT_TARGET = 'http://10.245.146.27:8008/';
  const WEBVPN_ORIGIN = 'https://webvpn.hitwh.edu.cn';
  const KEY_AND_IV = 'wrdvpnisthebest!';
  const CRYPTO_JS_URL =
    'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js';

  const source = window.prompt(
    '请输入校内地址（例如 https://lab.hit.edu.cn/；未指定协议时默认 HTTPS）',
    DEFAULT_TARGET,
  );
  if (source === null) return;

  const value = source.trim();
  let target;
  try {
    const normalized = /^[a-z][a-z\d+.-]*:\/\//i.test(value)
      ? value
      : 'https://' + value;
    target = new URL(normalized);
  } catch {
    window.alert('请输入有效的校内 URL。');
    return;
  }

  if (!/^https?:$/.test(target.protocol) || target.username || target.password) {
    window.alert('只支持不含用户名和密码的 HTTP(S) 地址。');
    return;
  }

  const script = document.createElement('script');
  script.src = CRYPTO_JS_URL;
  script.onload = () => {
    const key = CryptoJS.enc.Utf8.parse(KEY_AND_IV);
    const iv = CryptoJS.enc.Utf8.parse(KEY_AND_IV);
    const encrypted = CryptoJS.AES.encrypt(target.host, key, {
      iv,
      mode: CryptoJS.mode.CFB,
      padding: CryptoJS.pad.NoPadding,
    });
    const encryptedHost =
      CryptoJS.enc.Hex.stringify(iv) + encrypted.ciphertext.toString();
    const protocol = target.protocol.slice(0, -1);
    const finalUrl =
      WEBVPN_ORIGIN +
      '/' +
      protocol +
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
