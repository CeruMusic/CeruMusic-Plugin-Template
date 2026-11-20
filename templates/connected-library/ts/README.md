# connected-library / ts

桌面账号菜单中的「音乐库账号」支持添加多个演示昵称、切换和退出。该示例不联网，请勿填写真实密码。接入实际平台时，在 `ctx.accounts.register` 的 `login` 中使用平台接口换取会话，在 `profile` 中返回公开资料；不要把凭据写进插件存储。

Ceru Music v3 插件开发模板。此目录是源码，不是安装包。

## 运行 demo

1. 使用匹配的 v3 脚手架创建工程（本地开发套件可使用其 `npm run create` 命令）：

   ceru-plugin init my-plugin --template connected-library --lang ts

2. 进入目录，运行 npm install。
3. 运行 npm run dev，在澜音「设置 → 插件管理 → 管理设置 → 插件开发者模式」添加终端打印的 JS 文件。
4. 修改 src 中的代码；保存后自动类型检查并重载。
5. 运行 npm run build，只分发 dist/plugin.js。

## 编辑器

发现页的「已连接的音乐库」仅在选中 `catalog` 且当前子账号未过期时出现。`connection.visible` 每次读取宿主保存的账号状态，重启后无需播放或再次填写表单；退出最后一个账号或凭据过期后入口隐藏。插件设置始终可打开，其中的“演示连接”只验证服务器地址，不是账号登录。

在 `ceru.plugin.json` 中，若只需判断平台，可将 `when` 改为 `{ "selectedSource": "catalog" }`；只看连接则改为 `{ "predicate": "connection.visible" }`。两者并用时默认都须满足，可指定 `"combine": "any"`。

VS Code 按 F5 选择 Watch Ceru plugin，会启动本地构建监听，不会另开 Electron。
已在终端运行 npm run dev 时不必再按 F5。
配置文件有 JSON Schema 提示，SDK 提供参数类型、图标名称与 Lodash 方法补全。

## 宿主资源

- 平台图标：icon: { kind: 'host', name: 'platform.tx' }。
- 代码取图标：await ctx.icons.url('platform.tx')。
- 默认封面：await ctx.assets.url('placeholder.cover')。
- 共享工具：ctx.utils.lodash。

此模板的 `library` 是宿主渲染的 `native` 视图，`settings` 是自带页面代码的 `web` 视图。若需要复用宿主 Vue、TDesign 或播放器组件，选择 `component` 视图，不要将桌面组件复制进插件。
TypeScript、Vue 编译器、构建工具与开发服务器不会进入产物。
运行 `npm run typecheck` 只检查工程，不生成发行文件。可选 `npm run preview` 验证构建产物并打印路径；将该文件加入桌面的插件开发者模式即可预览，不会启动服务器。

若 VS Code 打开的是父目录，请打开本工程的 ceru-plugin.code-workspace，
再在“运行和调试”中选择 Watch Ceru plugin。
F5 执行当前下拉框中的配置，不会自动选择终端所在的子工程。

## 边界

### 音源选择与入口条件

`catalog` 可在未登录时注册、显示和点选。`beforeSelect: "catalog.enter"` 只拦截切入本实现，不拦截切走。动作返回 `true` 放行、`false` 保留原选择，或返回 `{ login: { accountId: 'catalog' } }` 让宿主发起该账号的登录。续登可带原 `connectionId`。登录成功后宿主再调用一次判断，只有返回 `true` 才提交；取消、改选、插件停用或撤权均不能提交旧选择。不要让普通判断动作自行等待用户输入。

发现页的 `when` 同时要求选中 `catalog` 且 `connection.visible` 返回真。只写 `{ "selectedSource": "catalog" }` 就是纯声明；只写 `{ "predicate": "connection.visible" }` 就是纯函数。二者同时声明时默认 `all`；要满足任意一项，写 `"combine": "any"`。判断动作可返回 `force-show` 或 `force-hide` 覆盖显隐。设置登录入口不要声明 `when`。

音源的 `when.predicate` 也可返回 `{ state: 'disabled', reason: '服务正在维护' }`。宿主在悬停或键盘聚焦时展示原因；不传 `reason` 就只置灰。需要点选登录时不要返回 `disabled`。入口隐藏或禁用不能代替受保护数据操作中的账号校验。

本模板面向 v3 协议，需要支持 native Surface 的 Host。
凭据保险箱、完整音乐业务和 Guest 安装需要正式 Host；不支持的调试调用会明确报错。
不要把私人 API Key、卡密或发行私钥提交到仓库。

此 demo 展示原生歌单网格、歌曲列表、账号菜单贡献、导入及播放动作，还有连接表单和状态更新；点击“演示连接”不会联网或保存密码。元数据来自本地常量，播放前需实现自己的 tracks.resolve。

在支持 v3 的澜音里启用插件后，打开歌单页的「我的音乐库」。清单里的 `ui.pages` 用 `mount: "playlist-section"` 声明入口；`src/index.ts` 的 `render.library` 返回列表数据，卡片和按钮由澜音绘制。点击「演示歌单」会进入宿主歌单详情。要验证登录条件，在搜索栏选中该音源，填写演示昵称，然后到发现页查看「已连接的音乐库」；取消登录时不会切换音源。

`account.summary` 从 `ctx.accounts.current('catalog')` 读取当前账号并返回公开摘要。`ctx.ui.setState` 只更新视图状态，不会登录或切换账号；表单登录、切换和退出由桌面账号菜单处理。
