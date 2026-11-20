# 页面扩展

侧边栏和设置页复用 Vue 搜索视图，歌单页动作槽提供入口。搜索首个可用音源（支持本地曲库），点击歌名播放，在“更多”中加入队列。

`SongList` 的 `actions` 指向清单声明的 logic 动作；`music.read` 与 `music.control` 分别授权搜索、播放及入队。视图只收到显示字段和本轮结果的临时 key，完整资源引用保留在 logic 中。未声明的收藏和下载不显示。

运行 `npm install`、`npm run typecheck`、`npm run dev`，将打印的 `dist/plugin.js` 添加到「设置 → 插件管理 → 管理设置 → 插件开发者模式」。保存源码自动重载；分发前运行 `npm run build` 和 `npm run validate`。

侧栏读取 `ui.pages[].icon`：示例使用 `{"kind":"host","name":"search"}`。也可以在工程的 `resources` 中声明图片，再引用 `{"kind":"asset","resource":"nav.logo"}`。没有图标或图片无法显示时回退为默认插件图标。
