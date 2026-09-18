# 手写单文件插件

`plugin.js` 本身就是可分发文件，不需要 `package.json`、`node_modules`、SDK import 或 CLI 构建。

可以使用字面量 `require()` 加载 [宿主模块清单](../../docs/HOST-SERVICES.md)。手写文件不能直接加载 npm 包；需要第三方包时，可以使用任意 bundler 将它打入同一个文件，或者使用 Ceru CLI。Core 不会读取作者机器上的 `node_modules`。

安装器静态读取 `exports.manifest`，不会先执行插件。`exports.activate` 是不可见逻辑，`exports.surfaces` 是可见页面；两者可以独立使用，也可以同时存在。
