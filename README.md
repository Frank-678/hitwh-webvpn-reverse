# HITWH WebVPN URL Generator

面向哈尔滨工业大学（威海）WebVPN 的链接生成脚本。它把目标校内 URL 转换为 WebVPN 可识别的规范加密路由。

访问资源仍需要有效的 WebVPN 登录会话，并且仅应访问自己被授权使用的校内资源。

## 路由格式

WebVPN 的规范格式为：

~~~text
https://webvpn.hitwh.edu.cn/{协议[-非默认端口]}/{IV + AES-CFB(主机名或IP)}{路径、查询参数、片段}
~~~

端口不参与加密，而是写在协议段。例如，下面两个地址的主机密文相同：

~~~text
http://10.245.146.27:8008/
https://webvpn.hitwh.edu.cn/http-8008/{密文}/

http://10.245.146.27/
https://webvpn.hitwh.edu.cn/http/{密文}/
~~~

这与 WebVPN 原搜索入口生成的格式一致。

## 支持范围

| 输入 | 行为 |
| --- | --- |
| IPv4 地址 | 支持例如 10.245.146.27、172.26.64.16、192.168.43.161、222.194.15.1 |
| 校内域名 | 支持例如 jwts.hitwh.edu.cn、labsafe.hit.edu.cn |
| HTTP / HTTPS | 完整 URL 会保留原协议；仅输入主机名/IP 时，脚本会要求明确选择协议 |
| 非默认端口 | 输出为 HTTP-端口 或 HTTPS-端口 路由 |
| 路径、查询参数、片段 | 一并保留 |

## 使用方法

1. 先在 WebVPN 中正常登录。
2. 新建一个浏览器书签，名称任意。
3. 将书签的网址替换为下面这一行，然后在普通网页中点击该书签：

~~~javascript
javascript:(()=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/Frank-678/hitwh-webvpn-reverse@main/calc.js';s.onerror=()=>alert('无法加载 WebVPN 链接生成脚本，请检查网络后重试。');document.head.appendChild(s)})()
~~~

4. 输入目标地址：

   - 粘贴完整 URL，例如 http://jwts.hitwh.edu.cn/ 或 https://lab.hit.edu.cn/
   - 也可只输入域名或 IPv4 地址；随后输入 http 或 https，不再静默猜测协议。

脚本会跳转到生成后的 WebVPN 链接。

## 开发者模式

在任意普通网页的开发者工具 Console 中运行 calc.js 的内容，也会打开相同的输入框并完成跳转。

## 验证向量

| 输入 | 生成结果 |
| --- | --- |
| http://10.245.146.27:8008/ | https://webvpn.hitwh.edu.cn/http-8008/77726476706e69737468656265737421a1a70fce736526012a5ec7fecf/ |
| http://lab.hit.edu.cn/ | https://webvpn.hitwh.edu.cn/http/77726476706e69737468656265737421fcf643d22f397c1e7b0c9ce29b5b/ |
| https://lab.hit.edu.cn:8443/portal?from=webvpn | https://webvpn.hitwh.edu.cn/https-8443/77726476706e69737468656265737421fcf643d22f397c1e7b0c9ce29b5b/portal?from=webvpn |

## 说明

请不要在浏览器内置页面（例如 chrome:// 页面）中运行书签脚本。
