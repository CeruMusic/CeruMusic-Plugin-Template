# 投稿指南

本仓库接受两类投稿：可直接安装的社区插件成品，以及供 Ceru CLI 创建新工程使用的开发模板。两者分别审核和验证，不要求插件作者开源；作者选择公开源码仓库时，可以在元数据中提供链接。

## 投稿流程

1. 阅读本指南，选择“插件成品”或“CLI 开发模板”。
2. 复杂或范围较大的投稿先创建对应 Issue，说明计划和兼容目标。小型修复可以直接提交 PR。
3. 按下文准备文件并在本地运行检查。
4. 提交 PR，填写 `.github/pull_request_template.md` 中适用于该投稿类型的内容。
5. 维护者检查目录、兼容信息、许可、权限说明和验证结果。通过审核的 CLI 模板还需由 CLI 维护者同步到发行快照。

Issue 模板用于提前说明投稿内容，不代表已接受或已进入发布。PR 是实际代码和文件变更的评审入口。

## 插件成品

成品插件必须是面向用户安装的构建产物，不需要一并提交完整开发工程。每个插件单独放在 `plugins/<插件ID>/`。当同一个 ID 同时提供 v2 与 v3 时，将新版本放入 `plugins/v2/<插件ID>/` 或 `plugins/v3/<插件ID>/`，保留已有目录。版本目录必须与插件 manifest 的 API 版本相符。

```text
plugins/example.author.plugin/
├── plugin.json
├── plugin.js
├── README.md
└── THIRD_PARTY_NOTICES.md
```

`plugin.json` 示例：

```json
{
  "id": "example.author.plugin",
  "name": "示例插件",
  "version": "1.0.0",
  "description": "简要说明插件的实际用途",
  "author": "作者名称",
  "license": "MIT",
  "source": "https://github.com/CeruMusic/CeruMusic-Plugin-Template/tree/main/plugins/example.author.plugin",
  "sourceCode": "https://github.com/example-author/example-plugin",
  "entry": "plugin.js"
}
```

必填字段包括稳定的 `id`、展示名、插件版本、描述、作者、许可证和投稿页 `source`。投稿页用于查看本仓库收录的安装说明和文件。`sourceCode` 是可选字段，只在作者愿意公开源码且已有自己的公开仓库时填写。它应指向对应开发者维护的仓库，不要指向本投稿仓库里的构建产物目录。未开源时省略即可。

本地成品使用 `entry` 指定 `.js` 文件。也可以使用 `download` 和 `sha256` 指向作者发布的固定版本文件，URL 必须为 HTTPS，SHA-256 必须是 64 位十六进制摘要；远端记录还要声明 `apiVersion` 为 `2` 或 `3`。`entry` 与 `download` 二选一。索引中的 API 版本由本地制品 manifest 识别，不能仅根据目录名或文档推断。

README 至少说明：

- 插件用途、适用场景和用户可见功能。
- 支持的 CeruMusic Host API、SDK 或桌面版本，以及安装步骤。
- 请求的权限、访问的网络服务和读取或写入的数据。
- 是否需要用户自己的账号、Cookie、API Key 或其他凭据，以及凭据保存位置。
- 作者和许可证、问题反馈地址，以及可选的作者源码仓库链接。
- 已执行的验证命令和未覆盖的验证范围。

同时提交必要的第三方许可证和来源说明。只能发布作者有权分发的文件。不得提交用户账号数据、个人化发放文件、卡密、Cookie、API Key、私钥、`node_modules`、开发缓存或本地工具链包。CI 不下载、不运行插件，也不代表安全背书。

## CLI 开发模板

CLI 模板用于初始化可继续开发的插件工程。模板放在 `templates/<模板ID>/`，通常同时提供 JavaScript 和 TypeScript 版本：

```text
templates/example-template/
├── js/
│   ├── ceru.plugin.json
│   ├── package.json
│   ├── README.md
│   └── src/
└── ts/
    ├── ceru.plugin.json
    ├── package.json
    ├── README.md
    └── src/
```

如果模板确实只适合一种语言，先用 Issue 说明原因和目标用户，再在 PR 中注明支持范围。模板应：

- 聚焦一个能运行、能展示核心 API 用法的小示例，不伪装成真实服务接入。
- 使用仓库当前支持的 manifest、CLI、SDK 和 Core API，明确版本要求及宿主兼容范围。
- 生成后包含清晰的源码、`README.md`、最小权限配置和必要的 VS Code 调试配置。
- 默认不在安装或初始化时暗中联网，不执行安装生命周期脚本，不包含真实凭据。
- 将第三方依赖打入插件成品，说明依赖许可，不要求宿主读取生成项目的 `node_modules`。
- 提供有效的类型检查、构建、静态校验和预览命令。生成项目必须能按 README 独立安装依赖并完成这些步骤。
- 将可复用的模板源码提交到 `templates/`，不要提交构建产物、`node_modules`、`.ceru-toolchain`、私钥或开发机缓存。

模板投稿者应在本地为每个语言版本创建一个临时工程，运行依赖安装、类型检查、测试、构建、插件校验和预览。若模板包含 Electron 宿主交互，还应记录实际做过的宿主验证；没有运行的验证应明确标注。

通过审核的模板会由 CLI 维护者同步到 Ceru CLI 的固定发行快照。合入本仓库不等于 CLI 版本已经发布。

## Issue 与 PR

在 GitHub 的 New issue 中选择“社区插件成品投稿”或“CLI 开发模板投稿”。Issue 中提供投稿名称、作者、目标 API 版本或模板 ID、主要用途、权限或依赖、验证计划，以及可选的作者源码仓库。不要在 Issue 或 PR 中粘贴凭据、私钥或用户数据。

PR 标题应说明类型和名称，例如 `plugins: add example.author.plugin v2` 或 `templates: add player utility template`。一个 PR 尽量只处理一个插件、一个模板或一组紧密相关的修复。PR 描述应列出改动内容、兼容目标、实际检查命令和结果、权限或安全影响、需要维护者确认的事项。

插件 PR 还应更新 `plugin.json`、README、许可文件和适用的订阅索引。不要手工编辑生成的 `plugins/index*.json`。运行：

```bash
npm test -- --write-index
npm test
```

模板 PR 应覆盖受影响的 JS/TS 变体，并从生成出来的临时工程验证 README 中承诺的命令。记录每条命令的实际结果，不要只写“已测试”。

维护者可能要求调整目录、兼容声明、权限说明、许可或验证覆盖。合入只表示变更通过仓库审核，不保证插件适用于所有宿主配置，也不表示 CLI 快照已经发布。

## 本地仓库检查

```bash
npm ci --ignore-scripts
npm test
```

仓库级检查只静态校验模板目录和插件投稿元数据，不执行插件成品。每个模板和插件的额外检查见其 README 与所属项目的工具链说明。

## 社区发现

作者可以给自己的公开插件仓库添加 `ceru-music` topic，便于在 [GitHub topic 页面](https://github.com/topics/ceru-music) 被发现。Topic、仓库收录和有效签名都不代表安全背书，也不会跳过 PR 评审。
