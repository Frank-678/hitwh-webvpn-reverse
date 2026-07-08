let script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js";
script.onload = function() {
    let host = "10.245.146.27:8008"; 
    let keyAndIv = "wrdvpnisthebest!";
    let key = CryptoJS.enc.Utf8.parse(keyAndIv);
    let iv = CryptoJS.enc.Utf8.parse(keyAndIv);
    
    // 执行 AES-CFB 加密，关键：必须指定 NoPadding 才能和系统后端的长度完全对上
    let encrypted = CryptoJS.AES.encrypt(host, key, {
        iv: iv,
        mode: CryptoJS.mode.CFB,
        padding: CryptoJS.pad.NoPadding 
    });
    
    let hex = CryptoJS.enc.Hex.stringify(iv) + encrypted.ciphertext.toString();
    let finalUrl = "https://webvpn.hitwh.edu.cn/http/" + hex + "/";
    
    console.log("✅ 算出来了！请直接复制下面的完整链接，去浏览器里访问：");
    console.log(finalUrl);
};
document.head.appendChild(script);
