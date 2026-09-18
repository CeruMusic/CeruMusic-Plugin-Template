# source / js

Ceru Music v2 插件开发模板。此目录是源码，不是安装包。

## 运行 demo

1. 使用脚手架创建工程：

   npm create ceru-plugin@latest my-plugin -- --template source --lang js

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

本模板面向 v2 协议。开发工作台不是当前 v1 桌面 Host 的兼容层。
凭据保险箱、完整音乐业务和 Guest 安装需要正式 Host；不支持的调试调用会明确报错。
不要把私人 API Key、卡密或发行私钥提交到仓库。

此 demo 搜索三条本地元数据，不连接真实音乐服务，也不伪造可播放地址。
