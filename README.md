# Ceru Music 插件模板与社区插件

这里同时接收 **开发模板** 和 **已经写好的插件**。

- templates/：可以通过脚手架创建工程的模板源码。
- plugins/：社区成品插件、使用说明及下载信息。
- GitHub topic：**ceru-music**。自己的插件仓库也可以添加这个 topic，便于发现。

工具链、SDK、构建器与 Electron 调试工作台在 [CeruMusic-Plugin-Cli](https://github.com/CeruMusic/CeruMusic-Plugin-Cli) 维护。

## 创建工程

v3 候选包尚未发布。若拿到本地开发套件，请按套件的 README 运行 `npm run create -- ../my-plugin --template playback-hook --lang ts`；它会将匹配版本的工具包复制到新工程。不要用 npm 的 latest 验收这套模板。

```bash
ceru-plugin init my-plugin --template vue --lang ts
cd my-plugin
npm install
npm run dev
```

运行 `npm run build` 后分发单个 `dist/plugin.js`。Web 视图会打入所需的框架运行代码；component 视图使用宿主注入的 Vue 和 TDesign。`npm run preview` 校验产物并打印要在真实桌面添加的文件路径。

CLI 是可选开发工具。无需 npm 的 [手写单文件示例](examples/handwritten/plugin.js) 直接使用 `exports.manifest`、`exports.activate`、`exports.surfaces` 与宿主 `require()` 模块，也能被v3 Core 安装运行。需要第三方包时，可使用 Ceru CLI 或任意 bundler 将它打入最终 JS；Core 不读取 `node_modules`。

项目配置直接写在 `ceru.plugin.json` 的 `config` 对象中，构建后位于
`exports.manifest.config`。插件通过有类型的 `ctx.config` 读取；后端个性化发行可用
Issuer 的 `personalization.config` 覆盖默认值，无需改写业务 bundle。
dev/build 还会生成不含配置值的 `@ceru/plugin-config` 类型声明，供 TypeScript/JSDoc 补全。

## 模板目录

| 模板                                             | 小 demo                                |
| ------------------------------------------------ | -------------------------------------- |
| [source](templates/source)                       | 三条本地音乐元数据的搜索               |
| [page-extension](templates/page-extension)       | 侧栏、设置及歌单按钮                   |
| [player-skin](templates/player-skin)             | 歌词、封面、背景三个播放器区域；需要实现区域挂载的 v3 宿主 |
| [playback-hook](templates/playback-hook)         | 点播与队列拦截，带可直接运行的离线场景测试 |
| [connected-library](templates/connected-library) | 连接表单与本地状态更新                 |
| [importer](templates/importer)                   | 向软件现有歌单导入窗口注册平台取数能力 |
| [guest-adapter](templates/guest-adapter)         | 父插件与 Guest bootstrap 结构          |
| [web-surface](templates/web-surface)             | 普通 DOM 页面                          |
| [vue](templates/vue)                             | Vue SFC、scoped CSS、计数器与宿主图标  |
| [vue-tsx](templates/vue-tsx)                     | Vue TSX 计数页面                       |
| [react](templates/react)                         | React Hooks、计数器与宿主图标          |
| [web-dist](templates/web-dist)                   | 已构建 HTML/CSS/JS 页面的封装          |

每种模板都有 ts/ 与 js/ 两个变体，附带格式化、VS Code 调试与配置提示。模板中的 \_gitignore 在创建项目时会还原为 .gitignore。

多根工作区或只打开父目录时，VS Code 不会递归发现子工程的 launch.json。请打开创建工程中的 ceru-plugin.code-workspace，选择 Watch Ceru plugin，再按 F5。

## 社区插件与订阅

你可以：

1. 将公开版插件文件、plugin.json 和 README 提交到 plugins/。
2. 在自己的仓库发布插件，为仓库添加 ceru-music topic，再提交带固定摘要的下载记录。
3. 先通过 Issue 介绍插件，再补充 PR。

v2 与 v3 使用独立的订阅索引。将对应的 Raw 地址添加到支持该索引格式的插件订阅器后，刷新索引即可检查版本和 SHA-256 更新。

- v2：`https://raw.githubusercontent.com/CeruMusic/CeruMusic-Plugin-Template/main/plugins/index.v2.json`
- v3：`https://raw.githubusercontent.com/CeruMusic/CeruMusic-Plugin-Template/main/plugins/index.v3.json`
- 全部：`https://raw.githubusercontent.com/CeruMusic/CeruMusic-Plugin-Template/main/plugins/index.json`

投稿约定见 [CONTRIBUTING.md](CONTRIBUTING.md)。成品文件会进行静态检查，CI 不运行上传的插件。

不要上传包含个人卡密、激活码、API Key 或私钥的个性化发行文件。公开版本应让安装者配置自己的连接与凭据。

topic、收录和签名有效都不等于安全背书。用户安装时仍需要查看权限；作者应提供清楚的功能、许可、来源与使用说明。

## 版本与兼容

本工作区模板面向 v3；已安装的 v2 社区插件仍由冻结的 v2 校验器检查，不改写成品文件。`npm ci && npm test` 使用仓库内的本地校验包，不依赖未发布的 npm 版本。

0.2.0 模板使用分组 Provider、标准歌曲/歌词数据、权限组和 `exports.*` 单文件格式。首页歌单/排行榜、导入入口和 UI Slot 均由 Manifest 贡献驱动；正式 Host 仍复用软件已有页面与交互。

CLI 分发已审核模板的固定快照，不会在用户创建项目时自动执行最新远端脚本。模板变更通过后，由维护者同步并发布新的 CLI 版本。

## v3 兼容性检查

各模板提供 `npm run check:compat`，可在类型检查和构建前检查宿主 API、组件库版本范围和播放器区域版本。与指定宿主比较时使用 `npm run check:compat -- --host ../ceru-host.json`；不指定时只比较本地工具包的参考运行时。页面扩展与皮肤模板的 Vue 开发依赖已同步到该运行时的 3.5.43。检查通过仍需在目标桌面测试。
