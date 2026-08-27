# HITWH WebVPN URL Generator

面向哈尔滨工业大学（威海）WebVPN 的链接生成脚本。它把目标校内 URL 转换为 WebVPN 可识别的加密路由。

访问资源仍需要有效的 WebVPN 登录会话，并且仅应访问自己被授权使用的校内资源。

## 支持范围

| 输入 | 行为 |
| --- | --- |
| IP 地址 | 保持原有兼容性，例如 10.245.146.27:8008 |
| 校内域名 | 支持例如 lab.hit.edu.cn |
| HTTP / HTTPS | 按输入协议生成对应的 WebVPN 路由；未写协议时默认 HTTPS |
| 端口、路径、查询参数、片段 | 一并保留 |

脚本加密的是目标 URL 的主机部分（域名或 IP 地址，包含非默认端口）；WebVPN 路径中的协议段不再被固定为 HTTP。

## 使用方法

1. 先在 WebVPN 中正常登录。
2. 新建一个浏览器书签，名称任意。
3. 将书签的网址替换为下面这一行，然后在普通网页中点击该书签：

~~~javascript
javascript:(()=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/Frank-678/hitwh-webvpn-reverse@main/calc.js';s.onerror=()=>alert('无法加载 WebVPN 链接生成脚本，请检查网络后重试。');document.head.appendChild(s)})()
~~~

4. 在弹窗中输入目标地址。可直接输入：

   - lab.hit.edu.cn
   - https://lab.hit.edu.cn/
   - http://10.245.146.27:8008/

第一个示例会自动按 HTTPS 处理。脚本会跳转到生成后的 WebVPN 链接。

## 开发者模式

在任意普通网页的开发者工具 Console 中运行 calc.js 的内容，也会打开相同的输入框并完成跳转。

## 验证向量

以下输出用于确认算法和 URL 组装未改变原有 IP 行为，同时支持域名：

| 输入 | 生成结果 |
| --- | --- |
| http://10.245.146.27:8008/ | https://webvpn.hitwh.edu.cn/http/77726476706e69737468656265737421a1a70fce736526012a5ec7fecf0f7b65dd15/ |
| lab.hit.edu.cn | https://webvpn.hitwh.edu.cn/https/77726476706e69737468656265737421fcf643d22f397c1e7b0c9ce29b5b/ |

## 说明

请不要在浏览器内置页面（例如 chrome:// 页面）中运行书签脚本。
