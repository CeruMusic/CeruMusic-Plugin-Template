# 扫码登录：两种内部 UI 模式

运行 `npm install`、`npm run typecheck`、`npm run build`，在软件开发者模式加载 `dist/plugin.js`，从账号菜单选择「扫码登录演示」。

修改 `src/index.js` 的 `loginView`：

- `undefined`：使用软件内置扫码模板。
- `'login'`：使用 `src/Login.vue`，Vue、TDesign 由宿主提供，不把组件实现打包到插件。
- `'login-html'`：使用纯 HTML/CSS/DOM 的 `src/login-html.js`，内部布局完全由插件设计。

三种方式使用相同的宿主弹窗外壳、标题、关闭按钮和动画。软件负责轮询、过期重试、取消及凭据保存。自定义视图从 `login` 状态读取二维码、`waiting/scanned` 与 `expiresAt`；不要向页面传递账号凭据或自己启动另一套轮询。

样式使用 `--td-brand-color`、`--td-text-color-primary` 等软件 CSS 变量，明暗模式和主题色会同步。组件视图调用 `useView().close()`，纯 DOM 视图调用 `ctx.close()` 即可取消。

本模板不联网、不收集真实凭据。二维码指向保留示例域名，无需扫描；演示约 5 秒显示已扫码、10 秒后完成。接入真实平台时替换二维码申请和 `poll(operation)`，使用本次操作的取消信号与显式网络/凭据权限。
