# 播放拦截示例

这是一个纯逻辑插件，不需要账号、网络、音源或 Electron 即可测试。编辑 src/index，把规则换成自己的。默认只处理演示前缀：点播以「[拦截示例]」开头的歌曲时取消操作；加入以「[优先示例]」开头的歌曲时改为下一首，其他歌曲不变。 定向移除带「[保护示例]」前缀的歌曲时取消该请求；这条规则不拦截清空整个队列。

1. 安装项目依赖：`npm install`。
2. 执行 `npm test`。命令先构建，再在独立 worker 中对 `tests/hooks.json` 的每个场景启动新插件，检查取消、未授权直通、一次性默认执行和队列位置。断言失败会给出场景名称并以非零状态退出。场景文件不会打入分发产物。
3. 启动 `npm run dev`，复制它打印的产物路径。在兼容 v3 的澜音中打开「设置 → 插件管理 → 管理设置 → 插件开发者模式」，添加该文件，启用插件，并在其权限设置中允许播放拦截。修改源码后自动重建；关闭权限可验证原有行为。此步骤才会接入真实播放器。
4. 发给别人前运行 `npm run build` 和 `npm run validate`。只分发 `dist/plugin.js`。

点播和入队输入只含公开歌曲摘要，暂停和继续的输入为 `{}`。场景可用 `source.kind` 区分 `ui`、`system` 和 `plugin`；插件来源还须填写 `pluginId` 与 `runtime`（2 或 3）。省略来源时按界面点击测试。普通播放钩子最多调用一次 `next`。每个处理器有 800 ms 执行预算，等待下游解析不计入预算。

### 测试失败换源

`player.resolve` 示例仅处理 `demo-primary` 的 `morning`：首次 `await next()` 成功就结束；失败时，改用 `demo-backup` 的 `morning-alt`，保留原音质。两个 ID 是测试数据，不假设不同平台共用歌曲 ID，也不会改写其他歌曲。真实插件应提供自己的公开歌曲映射，或在获得 `music.read` 授权后查询备用音源。

`tests/hooks.json` 中的 `resolveResults` 按顺序指定每次宿主解析是否成功。如 `[false, true]` 表示主源失败、备用源成功。`expect.input` 是最后一次解析的输入。钩子只能看到 `{ ok }`，不能读取播放地址；只有失败后才能用不同输入再试一次。`npm test` 不连接真实音源或音频设备。

### 观察操作与读取现场

`op.state` 提供冻结的 `player`、`route`、`account` 快照，分别需要声明和授予 `player.read`、`route.read`、`account.profile`。未授权时对应字段为 `null`；离线测试默认三项为空。

只想取消操作时，可以使用现有 `player.intercept` 权限注册 `ctx.events.on('player.pause', event => event.preventDefault())`，输入与来源只读。希望观察最终结果时，在清单 `manifest.uses.permissions` 添加 `player.read`，再注册 `ctx.events.on('player.pause:done', event => console.log(event.prevented, event.handledBy))`。完成事件不改变操作，在暂停全部拦截时仍然投递。`events.on` 返回的函数用于注销。

`ctx.app.operations.list()` 返回当前可主动调用的工具及输入/输出 Schema、执行权限。调用时使用 `ctx.app.call(name, input, {operation, permissionKey})`；例如清空队列为 `queue.clear`，需要 `player.control`。不要把拦截权限用于执行权限，也不要把钩子的临时私有歌曲句柄传给工具。
