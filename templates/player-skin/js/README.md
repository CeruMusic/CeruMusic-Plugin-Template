# 播放器皮肤

`ceru.plugin.json` 中的 `ui.skins[].settings` 声明装饰颜色与开关。宿主生成表单；`Background.vue` 在渲染时读取 `region.settings`，修改后无需重载。没有选中该套皮肤时，区域可能收到空设置，请保留组件自己的默认外观。

`src/BuiltinLyrics.vue`、`Artwork.vue`、`Background.vue` 分别接收宿主区域数据。歌词时间和 seek 均以毫秒为单位。模板不申请网络或音乐库访问权限，不提供音源。

默认歌词直接使用桌面提供的 `LyricAdapter`，插件包不包含该组件的绘制代码。打开「逐字歌词」可切换到宿主提供的 AML 渲染器。要自己排版，把 `ceru.plugin.json` 中的 `entries["view.lyrics"]` 改为 `src/Lyrics.vue`，该示例展示了如何按播放进度高亮歌词并跳到指定行。

个性化面板的卡片预览来自 `assets/studio-preview.svg`。直接替换这张 3:2 缩略图即可使用自己的设计，无需网络权限。若改用 WebP 或 PNG，在 `ceru.plugin.json` 的 `resources["studio.preview"]` 同时更新 `path`、`mime`，并将 `type` 改为 `base64`；二进制图片建议不超过 96 KiB。删去皮肤声明中的 `preview` 可恢复默认图标。

运行 `npm run typecheck`、`npm run build`、`npm run validate`。`npm run dev` 会输出开发插件路径。`preview` 校验产物，不模拟播放区域；实际外观需要支持 `player.*@1` 的桌面宿主。
