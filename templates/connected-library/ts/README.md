# connected-library / ts

Ceru Music v2 插件开发模板。此目录是源码，不是安装包。

## 运行 demo

1. 使用脚手架创建工程：

   npm create ceru-plugin@latest my-plugin -- --template connected-library --lang ts

2. 进入目录，运行 npm install。
3. 运行 npm run dev，打开独立 Electron 调试工作台。
4. 修改 src 中的代码；保存后自动类型检查并重载。
5. 运行 npm run build，只分发 dist/plugin.js。

## 编辑器

VS Code 按 F5 选择 Launch Ceru plugin；已有调试窗口时选择 Attach to Ceru plugin。
激活代码已经执行时，可点击“重新运行”再次命中断点。
配置文件有 JSON Schema 提示，SDK 提供参数类型、图标名称与 Lodash 方法补全。

## 宿主资源

- 平台图标：icon: { kind: 'host', name: 'platform.tx' }。
- 代码取图标：await ctx.icons.url('platform.tx')。
- 默认封面：await ctx.assets.url('placeholder.cover')。
- 共享工具：ctx.utils.lodash。

Vue/React 的生产运行代码、页面和样式直接编入发行 JS，宿主不提供框架。
TypeScript、Vue 编译器、构建工具与开发服务器不会进入产物。
运行 npm run preview 可只加载 dist/plugin.js 检查发布后的行为。

若 VS Code 打开的是父目录，请打开本工程的 ceru-plugin.code-workspace，
再在“运行和调试”中选择 Launch Ceru plugin；已经运行 npm/pnpm dev 时选择 Attach to Ceru plugin。
F5 执行当前下拉框中的配置，不会自动选择终端所在的子工程。

## 边界

本模板面向 v2 协议，需要支持 native Surface 的 Host。
凭据保险箱、完整音乐业务和 Guest 安装需要正式 Host；不支持的调试调用会明确报错。
不要把私人 API Key、卡密或发行私钥提交到仓库。

此 demo 展示原生歌单网格、歌曲列表、账号菜单贡献、导入及播放动作，还有连接表单和状态更新；点击“演示连接”不会联网或保存密码。元数据来自本地常量，播放前需实现自己的 tracks.resolve。

原生页面由 src/index.ts 中的 defineNativeView 返回标准 JSON 内容，playlistSections 把它放入 Host 现有本地／云歌单页；library.open 使用 navigation.open({ page: 'playlist', sectionId: 'library' }) 跳转定位，不打开抽屉。点击具体歌单传递完整 ResourceRef，进入 Host 歌单详情；播放调用 Host 队列和播放器；导入调用 Host 现有导入窗口。独立工作台保留本地／云歌单示意区域并渲染插件区块，完整音乐业务由正式 Host 实现。

账号摘要返回 signedIn、displayName、可选 avatarUrl/badge；账号变化通过 ctx.ui.setState 通知 Host。自定义账号登录页面也可使用 Vue 或 React 打包为 Web Surface，与原生音乐库页面同时存在。
