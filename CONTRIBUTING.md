# 投稿指南

欢迎提交新模板、改进示例，也欢迎分享已经完成的插件。

## 成品插件

创建 `plugins/你的插件ID/`，放入：

```text
plugins/example.author.plugin/
├── plugin.json
├── plugin.js
└── README.md
```

同一插件 ID 需要同时投稿 v2 与 v3 时，保留旧版原目录，并将新增版本放入 `plugins/v2/插件ID/` 或 `plugins/v3/插件ID/`。版本目录必须与制品 manifest 的 API 版本一致。

plugin.json 示例：

```json
{
  "id": "example.author.plugin",
  "name": "示例插件",
  "version": "1.0.0",
  "description": "用一句话说明插件功能",
  "author": "作者名称",
  "license": "MIT",
  "source": "https://github.com/example/plugin",
  "entry": "plugin.js"
}
```

索引由 `npm test -- --write-index` 从各插件目录的 `plugin.json` 和成品自动生成，不需要手工维护。CI 会检查提交的索引是否最新。仓库提供 `plugins/index.v2.json`、`plugins/index.v3.json` 两个订阅源和兼容用的 `plugins/index.json` 总索引。各条目包含 API 版本、直接下载 URL 和 SHA-256，插件更新后重新生成并提交索引即可供订阅端检测。

也可以用 `download` 和 `sha256` 替代 `entry`，指向你自己发布的固定版本文件。URL 必须使用 HTTPS；`sha256` 必须是该文件的 64 位十六进制摘要。远端投稿还需要在 `plugin.json` 声明 `apiVersion` 为 `2` 或 `3`。CI 只校验记录格式，不自动下载或运行其内容。

README 应说明：

- 功能和适用场景。
- 所需 Host/SDK 版本与安装方式。
- 请求哪些权限、访问哪些服务。
- 是否需要用户自己的账号或凭据。
- 作者、许可证、源代码/问题反馈地址。

本地提交的文件必须能通过对应版本的静态校验。v2 与 v3 分别进入独立订阅索引，成品不应跨版本混装或改写 manifest 来迎合另一版本。

不要提交个人化发放文件、密钥、卡密、用户数据、node_modules 或开发缓存。自动扫描不能替代作者和维护者的检查。

## 开发模板

在 templates/模板ID/ 下提供 ts/ 和 js/ 变体。若暂时只支持一种语言，请先在 Issue 讨论。

模板需要：

- 一个小而能演示核心用途的 demo，不伪装成已经接入真实商业服务。
- 清晰的源码、统一换行/缩进、必要注释和 README。
- TypeScript 类型检查、单文件 build 和静态校验通过。
- VS Code 配置与本地调试步骤可用。
- 默认最小权限，不在初始化时暗中联网。
- 明确依赖的宿主共享库；不把编译器或整个开发工程放入插件。

请在 PR 中记录实际使用的命令及结果。CLI 维护者会把通过检查的模板同步到发行快照。

## 本地检查

```bash
npm install --ignore-scripts
npm test
```

这只运行静态投稿检查，不执行成品插件。完整模板构建与 Electron demo 检查由工具链仓库提供。

## 社区发现

将 ceru-music topic 添加到自己的插件仓库，可以在 [GitHub topic 页面](https://github.com/topics/ceru-music) 被发现。标签不会自动授予权限、安装插件或跳过投稿评审。
