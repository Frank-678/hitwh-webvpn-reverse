# HITWH WebVPN URL Generator

面向哈尔滨工业大学（威海）WebVPN 的链接生成脚本。它把目标校内 URL 转换为 WebVPN 可识别的规范加密路由。

访问资源仍需要有效的 WebVPN 登录会话，并且仅应访问自己被授权使用的校内资源。本脚本不绕过 WebVPN 身份认证或资源访问控制。

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
| 合法 IPv4 地址 | 支持例如 10.245.146.27、172.26.64.16、192.168.43.161、222.194.15.1 |
| HITWH 域名 | 支持 <code>hitwh.edu.cn</code> 及其子域名，例如 <code>jwts.hitwh.edu.cn</code>、<code>cwoa.hitwh.edu.cn</code>、<code>lib.hitwh.edu.cn</code> |
| HTTP / HTTPS | 完整 URL 保留原协议；只输入主机名或 IPv4 时，脚本会要求明确选择协议 |
| 非默认端口 | 输出为 <code>http-端口</code> 或 <code>https-端口</code> 路由 |
| 路径、查询参数、片段 | 一并保留 |
| 不支持的主机 | <code>*.hit.edu.cn</code>、IPv6 和其他域名会在加载加密库前被拒绝 |

“支持”仅指 URL 路由格式可生成；资源是否可访问仍由 WebVPN 的服务端策略和你的登录权限决定。

## 使用方法

1. 先在 WebVPN 中正常登录。
2. 打开一个普通网页，例如 https://example.com/。
3. 新建一个浏览器书签，名称任意。
4. 将书签的网址替换为下面这一行，然后在该普通网页中点击书签：

~~~javascript
javascript:(()=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/Frank-678/hitwh-webvpn-reverse@main/calc.js';s.onerror=()=>alert('无法加载 WebVPN 链接生成脚本，请检查网络后重试。');document.head.appendChild(s)})()
~~~

5. 输入目标地址：

   - 粘贴完整 URL，例如 http://jwts.hitwh.edu.cn/、http://cwoa.hitwh.edu.cn/gzoa/ 或 http://10.245.146.27:8008/
   - 也可只输入 HITWH 域名或 IPv4 地址；随后输入 <code>http</code> 或 <code>https</code>

脚本会跳转到生成后的 WebVPN 链接。

## CSP 限制

书签会动态加载两个外部脚本：来自 <code>cdn.jsdelivr.net</code> 的本项目脚本，以及来自 <code>cdnjs.cloudflare.com</code> 的 CryptoJS。当前网页的 Content Security Policy（CSP）会限制这两个加载行为。

因此，浏览器内置页面（例如 <code>chrome://</code> 页面）、GitHub 等 CSP 不允许上述来源的网页，不能运行该书签。出现 <code>violates the following Content Security Policy</code> 时，请改在普通网页中运行；本项目不提供绕过 CSP 的方式。

## 开发者模式

在允许外部脚本加载的普通网页开发者工具 Console 中运行 calc.js 的内容，也会打开相同的输入框并完成跳转。

## 验证向量

| 输入 | 生成结果 |
| --- | --- |
| http://10.245.146.27:8008/ | https://webvpn.hitwh.edu.cn/http-8008/77726476706e69737468656265737421a1a70fce736526012a5ec7fecf/ |
| http://jwts.hitwh.edu.cn/ | https://webvpn.hitwh.edu.cn/http/77726476706e69737468656265737421fae0558f693861446900c7a99c406d3667/ |
| http://cwoa.hitwh.edu.cn/gzoa/ | https://webvpn.hitwh.edu.cn/http/77726476706e69737468656265737421f3e04e9d693861446900c7a99c406d3687/gzoa/ |

## 测试

~~~bash
node --test test/calc.test.js
~~~
