# react / js

Ceru Music v3 插件开发模板。此目录是源码，不是安装包。

## 运行 demo

1. 使用匹配的 v3 脚手架创建工程（本地开发套件可使用其 `npm run create` 命令）：

   ceru-plugin init my-plugin --template react --lang js

2. 进入目录，运行 npm install。
3. 运行 npm run dev，在澜音「设置 → 插件管理 → 管理设置 → 插件开发者模式」添加终端打印的 JS 文件。
4. 修改 src 中的代码；保存后自动类型检查并重载。
5. 运行 npm run build，只分发 dist/plugin.js。

## 编辑器

VS Code 按 F5 选择 Watch Ceru plugin，会启动本地构建监听，不会另开 Electron。
已在终端运行 npm run dev 时不必再按 F5。
配置文件有 JSON Schema 提示，SDK 提供参数类型、图标名称与 Lodash 方法补全。

## 宿主资源

- 平台图标：icon: { kind: 'host', name: 'platform.tx' }。
- 代码取图标：await ctx.icons.url('platform.tx')。
- 默认封面：await ctx.assets.url('placeholder.cover')。
- 共享工具：ctx.utils.lodash。

视图是否自带框架由清单的 `entry.views[].kind` 决定：`web` 页面打包自己用到的框架；`native` 由宿主绘制；`component` 复用宿主提供的 Vue、TDesign 和音乐组件。开发宿主风格的页面可选 `page-extension` 模板，播放器区域可选 `player-skin`，不需要复制桌面组件源码。
TypeScript、Vue 编译器、构建工具与开发服务器不会进入产物。
运行 `npm run typecheck` 只检查工程，不生成发行文件。可选 `npm run preview` 验证构建产物并打印路径；将该文件加入桌面的插件开发者模式即可预览，不会启动服务器。

若 VS Code 打开的是父目录，请打开本工程的 ceru-plugin.code-workspace，
再在“运行和调试”中选择 Watch Ceru plugin。
F5 执行当前下拉框中的配置，不会自动选择终端所在的子工程。

## 边界

本模板面向 v3 协议。需要支持 v3 的宿主。
凭据保险箱、完整音乐业务和 Guest 安装需要正式 Host；不支持的调试调用会明确报错。
不要把私人 API Key、卡密或发行私钥提交到仓库。
