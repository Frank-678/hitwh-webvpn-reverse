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
| 合法 IPv4 / IPv6 字面量 | 支持 IPv4，例如 10.245.146.27、172.26.64.16、192.168.43.161、222.194.15.1；IPv6 必须带方括号，例如 `[2001:db8::1]` |
| HITWH 域名 | 支持 <code>hitwh.edu.cn</code> 及其子域名，例如 <code>jwts.hitwh.edu.cn</code>、<code>cwoa.hitwh.edu.cn</code>、<code>lib.hitwh.edu.cn</code> |
| HTTP / HTTPS | 完整 URL 保留原协议；只输入主机名或 IP 字面量时，脚本会要求明确选择协议 |
| 非默认端口 | 输出为 <code>http-端口</code> 或 <code>https-端口</code> 路由 |
| 路径、查询参数、片段 | 一并保留 |
| 不支持的主机 | <code>*.hit.edu.cn</code>、其他域名和不合法的 IP 地址会在加载加密库前被拒绝 |

“支持”仅指 URL 路由格式可生成；资源是否可访问仍由 WebVPN 的服务端策略和你的登录权限决定。

## 使用方法

1. 先在 WebVPN 中正常登录。
2. 打开一个普通网页，例如 https://example.com/。
3. 新建一个浏览器书签，名称任意。
4. 将书签的网址替换为下面这一行，然后在该普通网页中点击书签：

~~~javascript
javascript:(()=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/Frank-678/hitwh-webvpn-reverse@7fff1de/calc.js';s.integrity='sha384-lhZHEZEdrJUnk8V7oXjBmQdSU7WPt6kW0vqh82y7BvhwAaE6pqyDDIoFUZYhrrHJ';s.crossOrigin='anonymous';s.referrerPolicy='no-referrer';s.onerror=()=>alert('无法加载 WebVPN 链接生成脚本，请检查网络后重试。');document.head.appendChild(s)})()
~~~

5. 输入目标地址：

   - 粘贴完整 URL，例如 http://jwts.hitwh.edu.cn/、http://cwoa.hitwh.edu.cn/gzoa/ 或 http://10.245.146.27:8008/
   - 也可只输入 HITWH 域名或 IP 字面量；随后输入 <code>http</code> 或 <code>https</code>

脚本会跳转到生成后的 WebVPN 链接。

## 本地静态访问 / 下载助手

仓库根目录的 `offline.html` 是一个独立的本地静态页面，不依赖当前网页的 CSP。它默认填入新教务系统 `http://jwts.hitwh.edu.cn/`，打开后会立即生成对应的官方 WebVPN 路由。

1. 将 `offline.html` 和 `webvpn-core.js` 下载到同一文件夹。
2. 在已登录官方 WebVPN 的普通浏览器中打开 `offline.html`。
3. 对新教务系统可直接使用默认地址；其他资源请粘贴完整 HTTP(S) 地址，然后点击“生成 WebVPN 链接”。
4. 复制结果或点击“在新标签页打开”。路径、查询参数和片段会被保留；因此资源服务器正常返回下载内容时，浏览器会按其响应处理下载。

该页面不会保存账号、密码或验证码，也不绕过学校的登录、WebVPN 或资源权限控制。它需要联网加载已固定完整性校验的 CryptoJS；能否查看或下载资源仍取决于你的 WebVPN 登录状态、目标系统权限和服务器响应。浏览器原生 Web Crypto API 不提供 AES-CFB，而官方 WebVPN 路由格式依赖该模式，因此当前保留兼容实现 CryptoJS 4.2.0；它已停止维护，只接收公开路由材料，不传入账号、密码、Cookie 或会话令牌。后续若更换依赖，必须重新计算 SRI 并运行全部路由回归测试。

## CSP 限制

书签会动态加载两个外部脚本：来自 <code>cdn.jsdelivr.net</code> 的已审查提交 `7fff1de`，以及来自 <code>cdnjs.cloudflare.com</code> 的 CryptoJS 4.2.0。两者均使用 SHA-384 Subresource Integrity（SRI）、匿名 CORS 和无 Referer 加载；当前网页的 Content Security Policy（CSP）仍会限制这两个加载行为。

因此，浏览器内置页面（例如 <code>chrome://</code> 页面）、GitHub 等 CSP 不允许上述来源的网页，不能运行该书签。出现 <code>violates the following Content Security Policy</code> 时，请改在普通网页中运行；本项目不提供绕过 CSP 的方式。

## 开发者模式

在允许外部脚本加载的普通网页开发者工具 Console 中运行 calc.js 的内容，也会打开相同的输入框并完成跳转。

## 验证向量

| 输入 | 生成结果 |
| --- | --- |
| http://10.245.146.27:8008/ | https://webvpn.hitwh.edu.cn/http-8008/77726476706e69737468656265737421a1a70fce736526012a5ec7fecf/ |
| http://jwts.hitwh.edu.cn/ | https://webvpn.hitwh.edu.cn/http/77726476706e69737468656265737421fae0558f693861446900c7a99c406d3667/ |
| http://cwoa.hitwh.edu.cn/gzoa/ | https://webvpn.hitwh.edu.cn/http/77726476706e69737468656265737421f3e04e9d693861446900c7a99c406d3687/gzoa/ |

## 现场验证

截图中的 19 个实际资源地址已在未登录浏览器中实际打开其转换路由，并均到达 WebVPN 的统一身份认证页；合法 IPv6 字面量也已完成同样的路由验证。完整的输入、转换结果、判定标准和未验证边界见 [现场验证记录](docs/live-validation.md)。

“到达认证页”只说明 WebVPN 接受路由格式。资源最终能否打开仍取决于登录状态、服务端策略和账号权限。

## 测试

~~~bash
node --check calc.js
node --check webvpn-core.js
node --test test/calc.test.js test/webvpn-core.test.js test/offline.test.js test/readme.test.js
~~~
