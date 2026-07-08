# HITWH WebVPN URL Generator (哈工大威海 WebVPN 链接生成器)

本项目通过逆向分析网瑞达 WebVPN 的前端加密算法，实现在**非校园网环境下**，直接生成并访问校内资源的直通链接。

当前默认配置用于访问：**哈课表资源 (10.245.146.27:8008)**。

## 核心原理
WebVPN (`webvpn.hitwh.edu.cn`) 采用 AES-CFB (NoPadding) 对内网 IP 进行加密。由于官方隐藏了前端的自定义跳转入口，本脚本提取了官方固定的 Key 与 IV (`wrdvpnisthebest!`)，在本地计算出合法的加密 Hex 字符串，从而实现自动跳转。

## 使用方法 

无需安装任何插件，通过**浏览器书签**即可一键免校园网访问！

1. 在浏览器随便新建一个书签，名字任意。
2. 编辑该书签，将 `网址 (URL)` 一栏替换为以下代码：
```javascript
javascript:(function(){let script=document.createElement('script');script.src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js";script.onload=function(){let host="10.245.146.27:8008";let keyAndIv="wrdvpnisthebest!";let key=CryptoJS.enc.Utf8.parse(keyAndIv);let iv=CryptoJS.enc.Utf8.parse(keyAndIv);let encrypted=CryptoJS.AES.encrypt(host,key,{iv:iv,mode:CryptoJS.mode.CFB,padding:CryptoJS.pad.NoPadding});let hex=CryptoJS.enc.Hex.stringify(iv)+encrypted.ciphertext.toString();window.location.href="https://webvpn.hitwh.edu.cn/http/"+hex+"/"};document.head.appendChild(script);})();
```
3. 在非校园网环境下，打开任意网站，再点击该书签，即可瞬间跳转至内网课表资源！

## 🛠 开发者模式 (Console)

如果你想访问其他内网 IP，可以在任意合法网页按 `F12` 打开控制台，运行 `calc.js` 中的完整代码，并自行修改 `host` 变量。

## 备注

两种方法都不要在浏览器自带标签页使用。

`10.245.146.27:8008`的校外可访问网址，经计算，是`https://webvpn.hitwh.edu.cn/http/77726476706e69737468656265737421a1a70fce736526012a5ec7fecf0f7b65dd15/`
