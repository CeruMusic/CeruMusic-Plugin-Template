# Ceru Music 插件模板与社区插件

这里同时接收 **开发模板** 和 **已经写好的插件**。

- templates/：可以通过脚手架创建工程的模板源码。
- plugins/：社区成品插件、使用说明及下载信息。
- GitHub topic：**ceru-music**。自己的插件仓库也可以添加这个 topic，便于发现。

工具链、SDK、构建器与 Electron 调试工作台在 [CeruMusic-Plugin-Cli](https://github.com/CeruMusic/CeruMusic-Plugin-Cli) 维护。

## 创建工程

~~~bash
npm create ceru-plugin@latest my-plugin -- --template vue --lang ts
cd my-plugin
npm install
npm run dev
~~~

运行 npm run build 后分发单个 dist/plugin.js。Vue/React 的生产运行代码与页面、样式一起编入文件，宿主不提供框架；开发编译器不会进入产物。npm run preview 可只加载这个文件检查发布后的行为。

## 模板目录

| 模板 | 小 demo |
| --- | --- |
| [source](templates/source) | 三条本地音乐元数据的搜索 |
| [connected-library](templates/connected-library) | 连接表单与本地状态更新 |
| [importer](templates/importer) | 曲目去重、导入计划预览 |
| [guest-adapter](templates/guest-adapter) | 父插件与 Guest bootstrap 结构 |
| [web-surface](templates/web-surface) | 普通 DOM 页面 |
| [vue](templates/vue) | Vue SFC、scoped CSS、计数器与宿主图标 |
| [vue-tsx](templates/vue-tsx) | Vue TSX 计数页面 |
| [react](templates/react) | React Hooks、计数器与宿主图标 |
| [web-dist](templates/web-dist) | 已构建 HTML/CSS/JS 页面的封装 |

每种模板都有 ts/ 与 js/ 两个变体，附带格式化、VS Code 调试与配置提示。模板中的 _gitignore 在创建项目时会还原为 .gitignore。

多根工作区或只打开父目录时，VS Code 不会递归发现子工程的 launch.json。请打开创建工程中的 ceru-plugin.code-workspace，选择 Launch Ceru plugin 或 Attach to Ceru plugin，再按 F5。

## 分享成品插件

你可以：

1. 将公开版插件文件、plugin.json 和 README 提交到 plugins/。
2. 在自己的仓库发布插件，为仓库添加 ceru-music topic，再提交带固定摘要的下载记录。
3. 先通过 Issue 介绍插件，再补充 PR。

投稿约定见 [CONTRIBUTING.md](CONTRIBUTING.md)。成品文件会进行静态检查，CI 不运行上传的插件。

不要上传包含个人卡密、激活码、API Key 或私钥的个性化发行文件。公开版本应让安装者配置自己的连接与凭据。

topic、收录和签名有效都不等于安全背书。用户安装时仍需要查看权限；作者应提供清楚的功能、许可、来源与使用说明。

## 版本与兼容

本仓库当前面向 Ceru v2 协议。开发工作台可以运行示例；原有 v1 桌面 Host 需要完成 v2 接入后才能安装这些产物。

CLI 分发已审核模板的固定快照，不会在用户创建项目时自动执行最新远端脚本。模板变更通过后，由维护者同步并发布新的 CLI 版本。
