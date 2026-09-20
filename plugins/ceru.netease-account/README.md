# 网易云账号插件

这是用 Ceru 插件 CLI 的 Vue 模板搭建的独立插件工程。SDK/Core/CLI/Issuer 使用 `0.3.5`，由 `package.json` 与锁文件固定；发布产物为 `dist/plugin.js`，插件版本为 `1.2.1`。本版本的歌单区块集成需要支持 `playlistSections` 的工具链与宿主。

扫码页面、二维码生成、轮询、账号状态、会员权益判断、每日推荐和个人歌单都在插件内实现。推荐和歌单通过 `defineNativeView` 返回界面声明，澜音直接使用自己的歌单卡片、歌曲列表、主题与滚动容器渲染。点击歌单进入原生详情页；播放接入原生底部播放器与队列；导入使用原生导入弹窗。

个人歌单显示在澜音现有“歌单”页（`/home/songlist`）的“网易云歌单”区块，与本地和云歌单共同组成同一个页面。用户通过软件已有侧边栏“歌单”进入；插件不在推荐页或账号页添加“我的歌单”按钮，也不打开独立歌单抽屉。

账号页采用插件自带的 Vue 页面，Vue 与二维码库随插件打包。账号入口注册在通用账号菜单中：未登录显示默认头像和登录入口，点击直接弹出扫码登录框，登录成功后自动关闭；已登录显示头像与昵称，VIP/SVIP 会员显示对应标记，普通账号不显示会员标记。悬停已登录账号显示二级菜单，退出后恢复未登录状态。没有专门的网易云侧边栏入口。

扫码弹框宽度为 360px，只显示二维码、一行状态和刷新/取消操作；已登录的账号页仅显示昵称、会员标记与退出操作。插件内容采用自然高度，不设置独立滚动容器。

## 开发和构建

需要 Node.js 22.12 或更高版本。进入本目录执行：

```powershell
npm ci
npm run dev
```

开发工作台可以独立运行，无须启动澜音。修改 `src` 中的文件会自动构建并重载。二维码登录需要允许网络权限；真实登录由用户在网易云音乐 App 中扫码并确认。

```powershell
npm run typecheck
npm run build
npm run validate
npm test
npm run test:ui
npm run preview
```

`preview` 只加载最终单文件产物，可检查分发后的行为。将 `dist/plugin.js` 导入支持 v2 Native Surface 的澜音，允许插件请求的网络权限，即可从账号菜单或插件设置打开网易云账号页。首页“网易云推荐”直接显示原生歌单与歌曲列表。点击播放时再授权播放控制权限。

## 从零创建同类工程

```powershell
npm create ceru-plugin@latest my-plugin -- --template vue --lang js
cd my-plugin
npm install
npm run dev
```

本工程展示三层边界：

| 文件                  | 职责                                                                               |
| --------------------- | ---------------------------------------------------------------------------------- |
| `ceru.plugin.json`    | 声明 provider、命令、Surface、账号菜单、歌单区块及权限                             |
| `src/index.js`        | 通过 `definePlugin` 注册动作和音乐协议，通过 `defineNativeView` 声明推荐与歌单界面 |
| `src/App.vue`         | 插件自己的 Vue 账号页面，通过 `context.invoke` 调用逻辑动作                        |
| `src/view.js`         | 通过 `defineSurface` 挂载 Vue，并在卸载时销毁应用                                  |
| `src/view-account.js` | Vue 账号页入口；原生页面的入口是逻辑动作，无需 UI bundle                           |

例如，账号 Surface 的声明为：

```json
{
  "id": "account",
  "kind": "web",
  "entry": "view.account",
  "title": "网易云账号",
  "presentation": { "kind": "modal", "size": 360 },
  "lifecycle": { "closeAction": "account.cancel" }
}
```

`account.cancel` 同时声明在 `contributes.commands` 中。宿主处理通用弹框和关闭事件；如何停止扫码由插件决定。Vue 在 `account.poll` 成功返回后调用 `context.close()`，因此不会在登录动作尚未完成时提前关闭并取消它。关闭已登录的账号页不会使其他页面正在读取的账号会话失效。`contributes.accountItems` 的 `logoutAction: "account.logout"` 将通用账号菜单的退出项连接到插件自己的会话清理逻辑。

原生页面的声明为：

```json
{ "id": "daily", "kind": "native", "entry": "render.daily", "title": "每日推荐" }
```

`render.daily` 在 `contributes.commands` 中声明并注册：

```js
import { defineNativeView } from '@shiqianjiang/ceru-plugin-sdk'

ctx.actions.register(
  'render.daily',
  defineNativeView(async (_input, operation) => ({
    type: 'page',
    sections: [
      {
        id: 'playlists',
        title: '推荐歌单',
        layout: 'grid',
        items: await loadPlaylists(operation), // 标准 ContentEntity[]，包含完整 ResourceRef
        onOpen: 'playlist.open',
        itemActions: [{ label: '导入歌单', action: 'playlist.import' }],
      },
    ],
  })),
)
```

`onOpen` 与 `itemActions` 接收 `{ ref }`，歌曲列表的 `onPlay` 接收 `{ ref, refs }`。插件校验资源归属，再调用 `ctx.ui.navigation.open`、`ctx.queue.replace`、`ctx.player.play` 等标准服务。`library.page` 等动作更新插件持有的分页状态，宿主再次调用 render 动作取得当前页。宿主不保存平台 Cookie，不请求网易云业务接口，也无需认识“每日推荐”等平台业务。

`homeSections` 中使用 `kind: "custom"`、`view: "daily"` 挂载原生 Surface。这里只有数据与动作协议；原生推荐页面不会创建 iframe 或 webview。若开发者需要完全自定义界面，可以像账号页一样选用 `kind: "web"` 并打包 Vue。

个人歌单通过 `contributes.playlistSections` 加入宿主已有歌单页：

```json
{
  "playlistSections": [{ "id": "library", "title": "网易云歌单", "view": "library", "order": 0 }]
}
```

对应的 `library` Surface 使用 `kind: "native"`、`entry: "render.library"`，不声明抽屉。下面的内部命令演示使用标准区块 ID 定位贡献，插件页面不为它添加按钮：

```js
ctx.actions.register('library.open', () =>
  ctx.ui.navigation.open({ page: 'playlist', sectionId: 'library' }),
)
```

宿主根据调用插件定位其贡献区块。命令 `library.open` 不声明 `view`，避免命令入口重新按独立 Surface 打开。日常使用统一从软件已有“歌单”入口访问；歌单数据、分页、登录状态和导入逻辑继续由插件负责。

旧的 `ceru.integrations`、平台账号菜单、专用登录组件和跨项目源码引用都不再使用。`legacy/` 保留迁移前源码供对照，不参与构建，也不能作为当前安装包。

## 账号和播放

- 会话写入插件私有存储；页面得到的状态不包含 Cookie。退出登录会删除会话。
- 网易云音乐协议 provider 固定为 `wy`，与其他网易云实现按宿主原有音源规则互斥选择；账号菜单贡献是独立的通用扩展点。每个原生资源同时带 `pluginId: "ceru.netease-account"`，便于导航和播放保留资源归属。
- 取消或关闭扫码页面会停止轮询；旧请求不能覆盖新一次登录。
- 开发工作台将测试会话保存在本工程 `.ceru-dev/storage/` 下，与澜音中的插件存储独立。
- 每日推荐和歌单需要真实账号。播放按服务端实际权益处理，试听、付费限制和无权限结果会显示为错误。
- 独立工作台用于验证插件页面和逻辑；实际播放器、歌单导航及导入由支持对应服务的宿主执行。

## 测试与第三方代码

`test/account.test.mjs` 使用本地接口数据检查会话、权限、会员规则和取消竞态；`test/native.test.mjs` 检查已有歌单页的区块声明与导航、原生声明、账号摘要、翻页、资源归属和播放队列，以及关闭账号页与并发刷新；`test/runtime.test.mjs` 把实际构建的单文件装入 Core 沙箱验证。这些测试不需要私人账号，也不会完成真实登录。

`npm run test:ui` 会启动独立 CLI 预览，使用接口测试数据验证账号 Vue 沙箱中的二维码、取消、登录，以及不含 iframe 的原生推荐/歌单、打开详情、播放、导入、翻页和退出流程。Windows 默认使用已安装的 Edge；其他系统先运行 `npx playwright install chromium`。也可通过 `CERU_BROWSER_CHANNEL` 指定浏览器通道。测试会话仅保存在测试内存中。

协议参考 NeteaseCloudMusicApiEnhanced，页面依赖 Vue 和 qrcode。许可与出处见 `THIRD_PARTY_NOTICES.md`，该文件作为资源包含在最终单文件中。
