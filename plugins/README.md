# 社区插件目录

订阅源按插件 API 版本拆分。订阅地址长期指向 `main` 分支，更新索引即可获取仓库中最新的插件版本。

| 版本 | 订阅索引 | 当前收录 |
| --- | --- | ---: |
| v2 | [index.v2.json](index.v2.json) | 7 |
| v3 | [index.v3.json](index.v3.json) | 1 |
| 全部 | [index.json](index.json) | 8 |

订阅时使用对应 JSON 文件的 Raw 地址：

- v2：`https://raw.githubusercontent.com/CeruMusic/CeruMusic-Plugin-Template/main/plugins/index.v2.json`
- v3：`https://raw.githubusercontent.com/CeruMusic/CeruMusic-Plugin-Template/main/plugins/index.v3.json`
- 全部：`https://raw.githubusercontent.com/CeruMusic/CeruMusic-Plugin-Template/main/plugins/index.json`

索引中的每项包含插件 API 版本、当前版本、说明、源码页、直接下载地址和 SHA-256。下载地址指向本仓库公开的单文件插件。订阅端刷新索引并比较版本或摘要，即可发现更新。

## v2 插件

| 插件 | 版本 | 作者 | 说明 |
| --- | ---: | --- | --- |
| [哔哩哔哩音源](ceru.bilibili/README.md) | 1.0.2 | CeruMusic | 搜索、收藏夹、分 P、排行榜、字幕歌词与音频播放 |
| [洛雪歌单导入](ceru.lx-playlist-import/README.md) | 1.0.0 | CeruMusic | 导入 LX Music 导出的歌单文件 |
| [Navidrome](ceru.navidrome/README.md) | 1.1.1 | CeruMusic | 接入自建音乐库、歌单、播放与歌词 |
| [网易云账号](ceru.netease-account/README.md) | 1.2.3 | CeruMusic | 扫码登录、每日推荐与个人歌单 |
| [音枢歌单同步](ceru.webdav-sync/README.md) | 0.3.5 | Yecho | 与音枢及其他客户端双向同步歌单 |
| [私人漫游](chaochao.roam/README.md) | 0.2.0 | chaochao × DeepSeek | 根据当前播放歌曲推荐并自动续播 |
| [波点音乐](lemon.bodian-account/README.md) | 1.7.0 | lemon | 账号、音源、歌单同步与私人推荐 |

## v3 插件

| 插件 | 版本 | 作者 | 说明 |
| --- | ---: | --- | --- |
| [网易云账号](v3/ceru.netease-account/README.md) | 1.6.3 | CeruMusic | 宿主账号菜单登录、推荐、歌单、搜索与播放 |

新投稿会根据构建产物中的 manifest 自动进入对应版本索引。相同插件 ID 的跨版本制品放在 `plugins/v2/` 或 `plugins/v3/` 下，索引保留各自 API 版本。

每个插件使用独立目录，包含 `plugin.json`、`README.md` 和公开版 JavaScript 文件，也可以提供 HTTPS 下载地址及 SHA-256。投稿规则见 [CONTRIBUTING.md](../CONTRIBUTING.md)。不得提交个人卡密、激活信息或私钥；CI 只进行静态校验，不运行插件。
