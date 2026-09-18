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

框架模板默认使用声明过版本的宿主 Vue/React 生产运行时；开发编译器不进入插件。
若需要把生产运行时一起打包，可将 ceru.plugin.json 的 sharedLibraries 改为 {}。

## 边界

本模板面向 v2 协议。开发工作台不是当前 v1 桌面 Host 的兼容层。
凭据保险箱、完整音乐业务和 Guest 安装需要正式 Host；不支持的调试调用会明确报错。
不要把私人 API Key、卡密或发行私钥提交到仓库。

此 demo 搜索三条本地元数据，不连接真实音乐服务，也不伪造可播放地址。
