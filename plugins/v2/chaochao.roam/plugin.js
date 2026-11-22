exports.manifest = {
  "manifestVersion": 2,
  "id": "chaochao.roam",
  "name": "私人漫游",
  "version": "0.2.0",
  "description": "像网易云私人漫游一样，基于当前播放的歌曲不断推荐相似作品，队列快放完时自动续歌，可以一直听下去。",
  "author": "DeepSeek（写代码）× chaochao（创意）",
  "engines": {
    "hostApi": "^2.0.0",
    "logicRuntime": "ceru-js@1",
    "uiSchema": "^1.0.0"
  },
  "modules": {
    "logic": {
      "entry": "logic.main"
    },
    "surfaces": [
      {
        "id": "roam",
        "kind": "native",
        "entry": "roam.view",
        "title": "私人漫游",
        "lifecycle": {
          "openAction": "roam.reset"
        }
      },
      {
        "id": "weights",
        "kind": "web",
        "entry": "view.weights",
        "title": "曲风权重",
        "presentation": {
          "kind": "drawer",
          "placement": "right",
          "size": 540
        }
      },
      {
        "id": "daily",
        "kind": "native",
        "entry": "roam.dailyView",
        "title": "每日推荐"
      },
      {
        "id": "help",
        "kind": "web",
        "entry": "view.help",
        "title": "使用说明",
        "presentation": {
          "kind": "drawer",
          "placement": "right",
          "size": 760
        }
      }
    ]
  },
  "contributes": {
    "providers": [
      {
        "id": "wy",
        "name": "网易云音乐（私人漫游）",
        "protocols": [
          "music.resolve@1",
          "music.lyrics@1"
        ],
        "qualities": [
          "128k",
          "320k",
          "flac"
        ],
        "connectionMode": "none"
      }
    ],
    "commands": [
      {
        "id": "roam.start",
        "title": "私人漫游：开始",
        "action": "roam.start"
      },
      {
        "id": "roam.stop",
        "title": "私人漫游：停止",
        "action": "roam.stop"
      },
      {
        "id": "roam.refresh",
        "title": "私人漫游：换一批推荐",
        "action": "roam.refresh"
      },
      {
        "id": "roam.dislike",
        "title": "私人漫游：不喜欢当前歌曲",
        "action": "roam.dislike"
      },
      {
        "id": "roam.open",
        "title": "打开私人漫游",
        "action": "roam.view",
        "view": "roam"
      },
      {
        "id": "roam.play",
        "title": "私人漫游：播放这首推荐",
        "description": "由推荐面板上的点击调用",
        "action": "roam.play"
      },
      {
        "id": "roam.dislikeItem",
        "title": "私人漫游：不喜欢这条推荐",
        "description": "由推荐面板上的点击调用",
        "action": "roam.dislikeItem"
      },
      {
        "id": "roam.genreUp",
        "title": "私人漫游：提高某个曲风的占比",
        "description": "由推荐面板上的曲风卡片 + 按钮调用",
        "action": "roam.genreUp"
      },
      {
        "id": "roam.genreDown",
        "title": "私人漫游：降低某个曲风的占比",
        "description": "由推荐面板上的曲风卡片 − 按钮调用",
        "action": "roam.genreDown"
      },
      {
        "id": "roam.genreClear",
        "title": "私人漫游：清空曲风权重",
        "action": "roam.genreClear"
      },
      {
        "id": "roam.tick",
        "title": "私人漫游：后台补歌检查",
        "description": "由定时任务调用，无需手动执行",
        "action": "roam.tick"
      },
      {
        "id": "roam.openWeights",
        "title": "私人漫游：打开曲风权重设置",
        "action": "roam.openWeights"
      },
      {
        "id": "roam.daily",
        "title": "每日推荐：打开今日推荐",
        "action": "roam.daily"
      },
      {
        "id": "roam.playDaily",
        "title": "每日推荐：把今天这 30 首加进队列并播放",
        "action": "roam.playDaily"
      },
      {
        "id": "roam.refreshDaily",
        "title": "每日推荐：重新生成今天的推荐",
        "action": "roam.refreshDaily"
      },
      {
        "id": "roam.help",
        "title": "私人漫游：使用说明与注意事项",
        "action": "roam.help"
      },
      {
        "id": "roam.openPanel",
        "title": "私人漫游：打开漫游面板",
        "description": "使用说明页里的「返回漫游面板」按钮调用",
        "action": "roam.openPanel"
      },
      {
        "id": "roam.back",
        "title": "私人漫游：返回漫游面板",
        "action": "roam.back"
      },
      {
        "id": "roam.reset",
        "title": "私人漫游：打开面板时复位",
        "description": "面板每次打开时由宿主调用",
        "action": "roam.reset"
      },
      {
        "id": "roam.dailyView",
        "title": "每日推荐：渲染",
        "description": "每日推荐独立页面的渲染动作",
        "action": "roam.dailyView"
      },
      {
        "id": "weights.load",
        "title": "私人漫游：读取曲风权重",
        "action": "weights.load"
      },
      {
        "id": "weights.save",
        "title": "私人漫游：保存曲风权重",
        "action": "weights.save"
      },
      {
        "id": "weights.reset",
        "title": "私人漫游：清空曲风权重",
        "action": "weights.reset"
      }
    ],
    "settingsPages": [
      {
        "id": "roam.home",
        "title": "私人漫游",
        "view": "roam"
      },
      {
        "id": "roam.weights",
        "title": "私人漫游 · 曲风权重",
        "view": "weights"
      }
    ],
    "sidebarItems": [
      {
        "id": "roam",
        "group": "tools",
        "title": "私人漫游",
        "view": "roam"
      },
      {
        "id": "roam.daily",
        "group": "tools",
        "title": "每日推荐",
        "view": "daily"
      }
    ]
  },
  "permissions": [
    {
      "key": "net",
      "name": "network.request",
      "reason": "请求网易云公开接口，获取相似歌曲、歌手热门与歌曲信息"
    },
    {
      "key": "playerRead",
      "name": "player.read",
      "reason": "读取当前播放歌曲与队列，决定推荐种子和何时续歌"
    },
    {
      "key": "playerCtl",
      "name": "player.control",
      "reason": "把推荐歌曲追加到播放队列，并在开始时播放"
    },
    {
      "key": "bg",
      "name": "background.run",
      "reason": "每分钟检查一次队列剩余曲目，快放完时自动续歌"
    }
  ],
  "dataSchemas": {
    "config": 1,
    "state": 1
  }
};

exports.package = { formatVersion: 2, syntax: 'js', signature: null };

/**
 * 私人漫游 · chaochao.roam
 * ---------------------------------------------------------------------------
 * 澜音 (CeruMusic) v2 单文件插件，手写、无需构建。
 *
 * 目标：像网易云“私人漫游”一样，播放到队列快结束时自动续歌，可以一直听下去。
 *
 * 分工：
 *   - 本插件只做【元数据 + 队列编排】：通过网易云公开 web JSON 接口（无需登录、
 *     无需 weapi 加密）拿“相似歌曲 / 歌手热门 / 歌单”，构造 ContentEntity。
 *   - 播放交给宿主：ref 写成 { providerId:'wy', scope:'provider' }，宿主用用户
 *     已选的网易云音源（聆澜等）解析播放，因此不需要在本插件里实现音源。
 *   - 续歌时机：宿主 background.run 定时任务每分钟检查一次队列剩余；另外
 *     queue.changed 事件触发时做一次快速检查（已知操作上下文仍新鲜时）。
 *
 * 数据来源（均为公开接口，实测 200）：
 *   /api/discovery/simiSong?songid=&limit=     相似歌曲
 *   /api/artist/top/song?id=                   歌手热门
 *   /api/song/detail?ids=[..]                  歌曲详情（取歌手 id / 封面）
 *   /api/search/get/web?s=&type=1&limit=       搜索（把非网易云歌曲换成网易云 songId）
 *   /api/playlist/detail?id=&n=&s=             冷启动歌单（默认热歌榜 3778678）
 */

// ==== 常量 =================================================================

const API = 'https://music.163.com'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const REQ_HEADERS = {
  'User-Agent': UA,
  Referer: 'https://music.163.com/',
  Accept: 'application/json, text/plain, */*',
}

// 权限 key（必须与 manifest.permissions[].key 完全一致）
const PERM_NET = 'net'
const PERM_READ = 'playerRead'
const PERM_CTL = 'playerCtl'
const PERM_BG = 'bg'

const BATCH = 3 // 每次补几首
// 队列里还剩 5 首就开始补，目标是垫到 8 首 → 每次补 3 首，
// 留足足 5 首的余量：就算这一批要联网取曲风歌单（1–2 秒），也绝不会出现「最后一首快放完了还没补」。
const AHEAD = 5
const TARGET_AHEAD = 8
const MAX_APPEND = 3

/** 这次该补几首：把队列垫回 TARGET_AHEAD，夹在 [BATCH, MAX_APPEND] 之间 */
function wantedCount(remain) {
  const gap = TARGET_AHEAD - remain
  return Math.min(MAX_APPEND, Math.max(BATCH, gap))
}
const POOL_TARGET = 24 // 候选池目标大小（提前联网备好，追加时零延迟）
const POOL_MIN = 12 // 池子低于这个数就在后台补
const TICK_MS = 60000 // 定时任务周期（tasks 最小 1 分钟）
const COLD_PLAYLIST = 3778678 // 网易云热歌榜，冷启动用
// 冷启动轮换的官方榜单：热歌榜 / 新歌榜 / 原创榜 / 飙升榜
const COLD_PLAYLISTS = [3778678, 3779629, 2884035, 19723756]

// 上一首是纯音乐时，用来「换味道」的曲风（避开轻音乐/古典/后摇这类容易继续给纯音乐的）
const CONTRAST_GENRES = ['华语', '流行', '摇滚', '民谣', '电子', '说唱', '爵士', '欧美', '日语', '粤语', '影视原声', 'ACG']
const STORE_KEY = 'roam.state'
const TASK_ID = 'roam.tick'
const PLUGIN_ID = 'chaochao.roam'
const OP_FRESH_MS = 110000 // 事件里复用操作上下文的最大年龄（宿主 operation 的 deadline 是 120 秒）

// 曲风（对应网易云「分类」里的语种 / 风格 / 主题标签），每个曲风一个 0–100 的推荐权重
const GENRES = [
  '华语', '欧美', '日语', '韩语', '粤语',
  '流行', '摇滚', '民谣', '古风', '电子', '舞曲', '说唱', '爵士', '古典',
  '金属', '朋克', '蓝调', '雷鬼', '乡村', '英伦', '后摇', '轻音乐', 'New Age',
  'ACG', '影视原声', '综艺', '游戏', '网络歌曲', '翻唱',
]
// 表单字段的 bind 只能用 ASCII（宿主用 ^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$ 校验），
// 所以每个曲风配一个英文 key，中文只用来显示；两个数组必须一一对应
const GENRE_KEYS = [
  'huayu', 'oumei', 'riyu', 'hanyu', 'yueyu',
  'liuxing', 'yaogun', 'minyao', 'gufeng', 'dianzi', 'wuqu', 'shuochang', 'jueshi', 'gudian',
  'jinshu', 'pengke', 'landiao', 'leigui', 'xiangcun', 'yinglun', 'houyao', 'qingyinyue', 'newage',
  'acg', 'yingshi', 'zongyi', 'youxi', 'wangluo', 'fanchang',
]

// ==== 运行时状态 ===========================================================

let host = null
let loaded = false
let lastOp = null
let lastOpAt = 0

/**
 * 记住一个「新鲜的」操作上下文。
 * 注意：操作上下文有 120 秒 deadline，而且**一旦被宿主取消就永久失效**
 * （日志里表现为 "Operation aborted" / "Plugin operation cancelled"）。
 * 所以每个宿主回调入口都刷新一次，遇到 aborted 就清空，等下一次刷新。
 */
function rememberOp(operation) {
  if (!operation || typeof operation !== 'object' || !operation.id) return
  lastOp = operation
  lastOpAt = Date.now()
}

function isDeadOpError(error) {
  return /aborted|cancell?ed/i.test(msg(error))
}

function dropDeadOp(error) {
  if (isDeadOpError(error)) {
    lastOp = null
    lastOpAt = 0
  }
  return msg(error)
}

const mem = {
  enabled: false,
  seedId: '',
  disliked: [], // ['185709', ...]
  appended: [], // ['wy:185709', ...] 最近追加过的曲目，防重复
  batch: [], // 最近一批 ContentEntity，供原生页展示
  pool: [], // 提前备好的候选（追加时不联网）
  weights: {}, // { 流行: 80, 古风: 50, ... } 每个曲风的推荐权重（0–100）
  instSkip: 0, // 还要「压制纯音乐」几批：>0 时本批不收纯音乐，每批减 1
  lastArtists: [], // 最近追加过的主歌手，避免同一个人连刷
  recentSongs: [], // 最近追加过的「歌名+歌手」指纹，挡同歌不同 id
  lastLangs: [], // 最近追加歌曲的语言（zh/en/ja/ko），用来打破「连着全是英文」
  queueLangs: [], // 队列里正在播的那几首的语言（比 lastLangs 更真实）
  pendingDrain: null, // 补歌过程中攒下的待处理事件
  plays: [], // [{ k:'歌名指纹', at: 时间戳 }] 最近听过的，7 天内不再推荐
  dislikedArtists: [], // [{ name:'歌手', at }] 「不喜欢」过的歌手，14 天内不再出现
  daily: null, // { date:'2026-11-01', items:[ContentEntity] } 今天的 30 首
  page: '', // 面板里当前显示哪一页：'' = 漫游面板，'daily' = 每日推荐，'help' = 公告
  filling: false,
  taskOn: false,
  busy: false,
  lastRun: 0,
  lastCount: 0,
  error: '',
}

// ==== 小工具 ===============================================================

function msg(e) {
  if (!e) return '未知错误'
  if (typeof e === 'string') return e
  if (e.message) return String(e.message)
  return String(e)
}

function log(level, message, data) {
  try {
    const fn = host && host.log && host.log[level]
    if (typeof fn === 'function') fn.call(host.log, '[roam] ' + message, data)
  } catch (_) {
    /* 日志失败不影响主流程 */
  }
}

function call(operation, permissionKey) {
  return { operation, permissionKey }
}

function num(v) {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

function isEntity(v) {
  return !!(v && typeof v === 'object' && v.ref && typeof v.ref.id === 'string')
}

function toast(message, level) {
  try {
    const p = host.ui.toast({ message, level: level || 'info' })
    if (p && typeof p.catch === 'function') p.catch(() => {})
  } catch (_) {
    /* ignore */
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }
  return arr
}

/** 从 ContentEntity 里取“网易云 songId”；取不到返回 '' */
function trackIdOf(entity) {
  const ref = entity && entity.ref
  if (!ref) return ''
  if (ref.providerId !== 'wy') return ''
  const id = String(ref.id || '')
  return /^\d+$/.test(id) ? id : ''
}

function keyOf(entity) {
  return 'wy:' + String(entity.ref.id)
}

// 纯音乐/纯器乐的识别：网易云不返回曲风标签，只能靠标题、专辑、歌手名里的关键词判断。
// 命中越多越可能是纯音乐（只用于「别一直往下漂」的软判断，不参与过滤硬性规则）。
const INST_WORDS = [
  '纯音乐', '纯音', '轻音乐', '钢琴', 'piano', '八音盒', 'music box', '助眠', '睡眠', '白噪音',
  '冥想', '瑜伽', 'spa', 'relax', '卡农', 'canon', '古典', 'classical', '吉他', 'guitar',
  '小提琴', 'violin', '大提琴', 'cello', '古筝', '二胡', '竹笛', '笛子', '口琴', '竖琴', 'harp',
  '贵族乐团', '班得瑞', 'bandari', '久石让', 'lofi', 'lo-fi', 'ost', '配乐', '轻音',
]

function instScore(entity) {
  if (!entity) return 0
  const artists = (entity.metadata && entity.metadata.artists) || []
  const album = (entity.metadata && entity.metadata.album && entity.metadata.album.title) || ''
  const text = (String(entity.title || '') + ' ' + album + ' ' + artists.join(' ')).toLowerCase()
  let hits = 0
  for (const w of INST_WORDS) {
    if (text.indexOf(w) >= 0) hits++
  }
  return hits
}

function isInstrumental(entity) {
  return instScore(entity) > 0 && !/(feat\.|ft\.)/i.test(String(entity.title || ''))
}

/** 一首歌的「类型指纹」：主歌手，用来避免同一歌手连着刷屏 */
function artistOf(entity) {
  const artists = (entity.metadata && entity.metadata.artists) || []
  return String(artists[0] || '').trim()
}

/**
 * 「同歌」指纹：同一首歌在网易云里常有多个 id（原版/翻唱/现场/不同版权方/不同音质），
 * 光按 songId 去重挡不住。这里只用「歌名」归一化后比较——去掉括号内容、feat、live 等后缀。
 * 标题太短（1–3 个拉丁字符）时退回用 id，避免 "Intro" 这种撞车。
 */
function songKeyOf(entity) {
  let t = String(entity.title || '').toLowerCase()
  t = t.replace(/\s*[-–—]\s*(live|remaster(ed)?|demo|acoustic|instrumental|伴奏|dj版|现场).*$/i, '')
  t = t.replace(/\b(feat|ft)\.?\s+.*$/i, '')
  t = t.replace(/[（(【\[].*?[）)】\]]/g, '')
  t = t.replace(/\s+/g, '').replace(/[^\p{L}\p{N}]/gu, '')
  const cjk = (t.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || []).length
  if (!t || (cjk === 0 && t.length < 4)) return 'id:' + String(entity.ref.id)
  return t
}

/** 判断一首歌大致是什么语言：中 / 日 / 韩 / 英 */
function langOf(entity) {
  const t = String(entity.title || '')
  if (/[\u3040-\u30ff]/.test(t)) return 'ja'
  if (/[\uac00-\ud7af]/.test(t)) return 'ko'
  if (/[\u4e00-\u9fff]/.test(t)) return 'zh'
  if (/[a-zA-Z]/.test(t)) return 'en'
  return 'other'
}

// 每种语言对应的「同类曲风」，用来在连续好几首同语言时换到别的语种
const LANG_GENRES = {
  zh: ['华语', '粤语', '古风', '网络歌曲'],
  en: ['欧美', '英伦', '爵士', '乡村'],
  ja: ['日语'],
  ko: ['韩语'],
}

// 「最近听过就别再推」的窗口；「不喜欢某位歌手」的冷静期
const PLAY_SKIP_MS = 604800000 // 7 天
const ARTIST_SKIP_MS = 1209600000 // 14 天
const DAILY_SIZE = 30

function todayKey() {
  const d = new Date()
  const p = n => String(n).padStart(2, '0')
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())
}

/** 这首歌最近 7 天听过没有 */
function playedRecently(songKey) {
  const now = Date.now()
  for (const p of mem.plays) {
    if (p && p.k === songKey && now - Number(p.at || 0) < PLAY_SKIP_MS) return true
  }
  return false
}

/** 这位歌手是不是被「不喜欢」过（14 天内） */
function artistSuppressed(name) {
  if (!name) return false
  const now = Date.now()
  for (const a of mem.dislikedArtists) {
    if (a && a.name === name && now - Number(a.at || 0) < ARTIST_SKIP_MS) return true
  }
  return false
}


/** 当前设了权重的曲风（权重 > 0） */
function weightedGenres() {
  const out = []
  for (const g of GENRES) {
    const w = Number(mem.weights[g]) || 0
    if (w > 0) out.push({ name: g, weight: w })
  }
  return out
}

/** 按权重随机抽一个曲风（权重越高被抽中的概率越大） */
function pickGenreByWeight(list) {
  if (!list.length) return ''
  let total = 0
  for (const it of list) total += it.weight
  if (total <= 0) return ''
  let roll = Math.random() * total
  for (const it of list) {
    roll -= it.weight
    if (roll <= 0) return it.name
  }
  return list[list.length - 1].name
}

/** 用文字画一根 0–100 的拉条：█████░░░░░ 50% */
function weightBar(value) {
  const v = Math.max(0, Math.min(100, Math.round(Number(value) || 0)))
  const filled = Math.round(v / 10)
  return '▮'.repeat(filled) + '▯'.repeat(10 - filled) + ' ' + v + '%'
}

/** 网易云 song 对象 -> ContentEntity（兼容 web 接口的 artists/album/duration 与 ar/al/dt） */
function toEntity(song) {
  if (!song || song.id === undefined || song.id === null) return null
  const id = String(song.id)
  if (!/^\d+$/.test(id)) return null

  const rawArtists = song.artists || song.ar || []
  const artists = rawArtists.map(a => (a && a.name ? String(a.name) : '')).filter(Boolean)
  const album = song.album || song.al || {}
  const durationMs = num(song.duration) || num(song.dt)
  const rawPic =
    (typeof album.picUrl === 'string' && album.picUrl) ||
    (typeof album.blurPicUrl === 'string' && album.blurPicUrl) ||
    ''

  const metadata = { artists: artists.length ? artists : ['未知歌手'] }
  if (album && album.name) {
    metadata.album = album.id
      ? { id: String(album.id), title: String(album.name) }
      : { title: String(album.name) }
  }
  if (rawPic) metadata.artworkUrl = rawPic.replace(/^http:\/\//, 'https://')
  if (durationMs) metadata.durationMs = durationMs

  return {
    ref: { pluginId: PLUGIN_ID, providerId: 'wy', kind: 'track', id, scope: 'provider' },
    title: String(song.name || song.title || '未知歌曲'),
    subtitle: metadata.artists.join(' / '),
    durationMs,
    capabilities: ['play'],
    playable: true,
    metadata,
  }
}

// ==== 持久化 ===============================================================

async function load() {
  if (loaded) return
  loaded = true
  try {
    const v = await host.storage.get(STORE_KEY)
    if (v && typeof v === 'object') {
      mem.enabled = v.enabled === true
      mem.seedId = typeof v.seedId === 'string' ? v.seedId : ''
      mem.disliked = Array.isArray(v.disliked) ? v.disliked.filter(x => typeof x === 'string') : []
      if (v.weights && typeof v.weights === 'object') {
        const w = {}
        for (const g of GENRES) {
          const n = Number(v.weights[g])
          if (Number.isFinite(n) && n > 0) w[g] = Math.max(0, Math.min(100, Math.round(n)))
        }
        mem.weights = w
      }
      mem.appended = Array.isArray(v.appended) ? v.appended.filter(x => typeof x === 'string') : []
      mem.batch = Array.isArray(v.batch) ? v.batch.filter(isEntity).slice(0, 20) : []
      mem.lastCount = typeof v.lastCount === 'number' ? v.lastCount : 0
      mem.instSkip = typeof v.instSkip === 'number' && v.instSkip > 0 ? Math.min(3, v.instSkip) : 0
      mem.lastArtists = Array.isArray(v.lastArtists) ? v.lastArtists.filter(x => typeof x === 'string').slice(-12) : []
      mem.recentSongs = Array.isArray(v.recentSongs) ? v.recentSongs.filter(x => typeof x === 'string').slice(-200) : []
      mem.lastLangs = Array.isArray(v.lastLangs) ? v.lastLangs.filter(x => typeof x === 'string').slice(-12) : []
      mem.plays = Array.isArray(v.plays)
        ? v.plays.filter(p => p && typeof p.k === 'string' && Number.isFinite(Number(p.at))).slice(-600)
        : []
      mem.dislikedArtists = Array.isArray(v.dislikedArtists)
        ? v.dislikedArtists.filter(a => a && typeof a.name === 'string').slice(-200)
        : []
      mem.daily =
        v.daily && typeof v.daily.date === 'string' && Array.isArray(v.daily.items)
          ? { date: v.daily.date, items: v.daily.items.filter(isEntity) }
          : null
    }
  } catch (e) {
    log('warn', '读取状态失败', msg(e))
  }
}

async function save() {
  try {
    await host.storage.set(STORE_KEY, {
      enabled: mem.enabled,
      seedId: mem.seedId,
      disliked: mem.disliked.slice(-300),
      appended: mem.appended.slice(-400),
      weights: mem.weights,
      batch: mem.batch.slice(0, 20),
      lastCount: mem.lastCount,
      instSkip: mem.instSkip,
      lastArtists: mem.lastArtists.slice(-12),
      recentSongs: mem.recentSongs.slice(-200),
      lastLangs: mem.lastLangs.slice(-12),
      plays: mem.plays.slice(-600),
      dislikedArtists: mem.dislikedArtists.slice(-200),
      daily: mem.daily && mem.daily.items ? { date: mem.daily.date, items: mem.daily.items } : null,
    })
  } catch (e) {
    log('warn', '保存状态失败', msg(e))
  }
}

// 合并写入：补歌路径上不为了存盘去等一次存储 IPC
let saveSoonTimer = null
function saveSoon() {
  if (saveSoonTimer) return
  saveSoonTimer = setTimeout(() => {
    saveSoonTimer = null
    save().catch(() => {})
  }, 1500)
}

// ==== 网络 =================================================================

async function getJson(operation, path, params) {
  const pairs = []
  const src = params || {}
  Object.keys(src).forEach(k => {
    const v = src[k]
    if (v === undefined || v === null || v === '') return
    pairs.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(v)))
  })
  const url = API + path + (pairs.length ? '?' + pairs.join('&') : '')

  let res
  try {
    res = await host.http.request({
      permissionKey: PERM_NET,
      url,
      method: 'GET',
      headers: REQ_HEADERS,
      timeoutMs: 15000,
      operation,
    })
  } catch (e) {
    throw new Error('网络请求失败：' + msg(e))
  }

  const status = res && typeof res.status === 'number' ? res.status : 0
  if (status !== 200) throw new Error('接口 HTTP ' + status)

  let body = res.body
  if (typeof body === 'string') {
    const text = body.trim()
    if (text.charAt(0) === '<') throw new Error('接口返回了网页而不是 JSON')
    try {
      body = JSON.parse(text)
    } catch (e) {
      throw new Error('接口返回的不是合法 JSON')
    }
  }
  if (!body || typeof body !== 'object') throw new Error('接口返回为空')
  if (body.code !== undefined && body.code !== 200) throw new Error('接口错误码 ' + body.code)
  return body
}

async function fetchSimi(operation, songId, limit) {
  const body = await getJson(operation, '/api/discovery/simiSong', { songid: songId, limit: limit || 40 })
  return Array.isArray(body.songs) ? body.songs : []
}

async function fetchArtistTop(operation, artistId, limit) {
  const body = await getJson(operation, '/api/artist/top/song', { id: artistId })
  const list = Array.isArray(body.songs) ? body.songs : []
  return list.slice(0, limit || 20)
}

async function fetchSongDetail(operation, ids) {
  const body = await getJson(operation, '/api/song/detail', { ids: JSON.stringify(ids) })
  return Array.isArray(body.songs) ? body.songs : []
}

async function searchSongs(operation, keyword, limit) {
  // 注意：/api/search/get/web 现在经常回 405「操作频繁」，改用老的 /api/search/get
  const body = await getJson(operation, '/api/search/get', {
    s: keyword,
    type: 1,
    limit: limit || 5,
    offset: 0,
  })
  const result = body.result || {}
  return Array.isArray(result.songs) ? result.songs : []
}

async function fetchPlaylistTracks(operation, playlistId, limit) {
  const body = await getJson(operation, '/api/playlist/detail', { id: playlistId, n: limit || 60, s: 0 })
  const result = body.result || {}
  const list = Array.isArray(result.tracks) ? result.tracks : []
  return list.slice(0, limit || 60)
}

/** 按「分类」取歌单（华语/摇滚/电子…），返回 [{id,name}] */
async function fetchGenrePlaylists(operation, cat, limit) {
  const body = await getJson(operation, '/api/playlist/list', { cat, limit: limit || 10, offset: 0 })
  const list = Array.isArray(body.playlists) ? body.playlists : []
  return list
    .filter(p => p && p.id)
    .map(p => ({ id: String(p.id), name: String(p.name || '') }))
}

// ==== 推荐逻辑 =============================================================

async function readQueue(operation) {
  try {
    const q = await host.queue.get(call(operation, PERM_READ))
    return {
      items: Array.isArray(q && q.items) ? q.items : [],
      currentIndex: q && typeof q.currentIndex === 'number' ? q.currentIndex : -1,
      revision: (q && q.revision) || '',
    }
  } catch (e) {
    log('warn', '读取队列失败', msg(e))
    return { items: [], currentIndex: -1, revision: '' }
  }
}

async function readPlayer(operation) {
  try {
    return await host.player.getState(call(operation, PERM_READ))
  } catch (e) {
    return null
  }
}

/** 找一个网易云 songId 当种子：当前播放 > 当前队列 > 搜索匹配 > 历史 > 上次种子 */
async function resolveSeed(operation, current) {
  const direct = trackIdOf(current)
  if (direct) return direct

  // 队列清空、也没在放歌：**不再拿旧种子往下漂**。
  // 旧种子可能来自上一轮的「轻音乐/纯音乐」歌单，继续顺着 simiSong 漂只会越漂越纯音乐，
  // 所以这种情况直接走热歌榜冷启动（见 buildCandidates 的兜底）。
  if (!current) return ''

  // 非网易云曲目：用「歌名 + 歌手」在网易云里找一首最接近的
  if (current.title) {
    const artists = (current.metadata && current.metadata.artists) || []
    const keyword = String(current.title) + (artists.length ? ' ' + artists[0] : '')
    try {
      const hits = await searchSongs(operation, keyword, 3)
      for (const hit of hits) {
        const id = String(hit.id || '')
        if (/^\d+$/.test(id)) return id
      }
    } catch (e) {
      log('info', '种子搜索失败', msg(e))
    }
  }

  try {
    const page = await host.history.list(undefined, call(operation, PERM_READ))
    const items = (page && page.items) || []
    for (const it of items) {
      const id = trackIdOf(it)
      if (id) return id
    }
  } catch (e) {
    /* 历史不可用就算了 */
  }

  return mem.seedId || ''
}

/**
 * 构造候选（不写队列）：相似歌曲 + 歌手热门 + 热歌榜兜底。
 * 会把队列里已有的、池子里已有的、刚推过的、被「不喜欢」的都过滤掉。
 */
async function buildCandidates(operation, need) {
  const queue = await readQueue(operation)
  const player = await readPlayer(operation)
  const queueEmpty = !queue.items.length
  const current = (player && player.track) || queue.items[queue.currentIndex] || null

  // 队列空 = 冷启动：播放器里可能还留着上一首（甚至就是上一轮的纯音乐），
  // 这时候不能拿它当种子，否则 simiSong 会一路顺着纯音乐漂下去。直接走热歌榜兜底。
  const seed = queueEmpty ? '' : (await resolveSeed(operation, current)) || mem.seedId
  log('debug', '推荐种子', {
    seed: seed || '(冷启动:热歌榜)',
    cold: queueEmpty,
    current: current && current.ref ? String(current.ref.id) : '',
  })

  const seen = new Set()
  queue.items.forEach(it => {
    if (isEntity(it)) seen.add(keyOf(it))
  })
  mem.pool.forEach(it => seen.add(keyOf(it)))
  const recently = new Set(mem.appended.slice(-300))
  const disliked = new Set(mem.disliked)

  // 同歌指纹：队列 + 池子 + 最近推过的（防止同歌不同 id 的翻唱/现场版混进来）
  const seenSongs = new Set()
  queue.items.forEach(it => {
    if (isEntity(it)) seenSongs.add(songKeyOf(it))
  })
  mem.pool.forEach(it => seenSongs.add(songKeyOf(it)))
  ;(mem.recentSongs || []).forEach(k => seenSongs.add(k))

  // —— 防漂移：上一首是纯音乐时，这批换味道（相似推荐会顺着纯音乐一路给纯音乐）——
  const lastTrack = current || (mem.batch.length ? mem.batch[mem.batch.length - 1] : null)
  const blockInst = mem.instSkip > 0
  const recentArtists = new Set(mem.lastArtists.slice(-4))
  // 最近 3 首都是同一种语言（比如连着英文歌）时，这批先插一首别的语种。
  // 两个来源都看：队列里正在播的那几首（最真实）+ 我们最近追加的几首。
  const recentLangs = (mem.lastLangs || []).slice(-3)
  const tailLangs = queue.items
    .slice(Math.max(0, queue.currentIndex - 2), queue.currentIndex + 1)
    .filter(isEntity)
    .map(langOf)
  const monoOf = arr =>
    arr.length >= 3 && arr.every(l => l === arr[0]) && arr[0] !== 'other' ? arr[0] : ''
  const monoLang = monoOf(tailLangs) || monoOf(recentLangs)
  let relax = false
  if (lastTrack) {
    log('debug', '防漂移', {
      blockInst,
      instSkip: mem.instSkip,
      last: String(lastTrack.title || ''),
      inst: isInstrumental(lastTrack),
      monoLang,
    })
  }

  const picked = []
  function accept(entity) {
    if (!entity) return false
    const key = keyOf(entity)
    if (seen.has(key)) return false
    if (recently.has(key)) return false
    if (disliked.has(entity.ref.id)) return false
    const sk = songKeyOf(entity)
    if (seenSongs.has(sk)) return false
    if (!relax) {
      if (blockInst && isInstrumental(entity)) return false
      const ar = artistOf(entity)
      if (ar && recentArtists.has(ar)) return false
      if (ar && artistSuppressed(ar)) return false
      if (playedRecently(sk)) return false
    }
    seen.add(key)
    seenSongs.add(sk)
    picked.push(entity)
    return picked.length >= need
  }

  // 三个来源，按「曲风浓度」决定先后：浓度越高，曲风歌单越靠前
  async function simiStep() {
    if (!seed) return
    try {
      const simi = await fetchSimi(operation, seed, 40)
      const list = shuffle(simi.map(toEntity).filter(Boolean))
      for (const e of list) {
        if (accept(e)) break
      }
    } catch (e) {
      log('warn', '相似歌曲失败', msg(e))
      mem.error = msg(e)
    }
  }

  async function artistStep() {
    if (!seed) return
    try {
      const detail = await fetchSongDetail(operation, [Number(seed)])
      const first = detail[0]
      const artistId = first && first.artists && first.artists[0] && first.artists[0].id
      if (!artistId) return
      const top = await fetchArtistTop(operation, artistId, 20)
      const list = shuffle(top.map(toEntity).filter(Boolean))
      for (const e of list) {
        if (accept(e)) break
      }
    } catch (e) {
      log('info', '歌手热门失败', msg(e))
    }
  }

  // 曲风歌单：从「分类」里拿歌单再抽歌（同曲风之间随机，不会一直是同一个歌单）
  async function genreStep(name, want) {
    if (!name || name === '热门' || want <= 0) return
    const before = picked.length
    const limit = Math.min(need, before + want)
    try {
      const playlists = await fetchGenrePlaylists(operation, name, 12)
      if (!playlists.length) return
      const taps = shuffle(playlists).slice(0, 2)
      for (const p of taps) {
        const tracks = await fetchPlaylistTracks(operation, p.id, 50)
        const list = shuffle(tracks.map(toEntity).filter(Boolean))
        for (const e of list) {
          if (accept(e) || picked.length >= limit) break
        }
        if (picked.length >= limit) break
      }
    } catch (e) {
      log('info', '曲风歌单失败 ' + name, msg(e))
    }
  }

  // 有曲风权重时：按权重决定这一批里各曲风各占几首
  const weighted = weightedGenres()
  if (weighted.length) {
    const plan = {}
    for (let i = 0; i < need; i++) {
      const g = pickGenreByWeight(weighted)
      if (g) plan[g] = (plan[g] || 0) + 1
    }
    for (const g of Object.keys(plan)) {
      if (picked.length >= need) break
      await genreStep(g, plan[g])
    }
  }

  // 没有设权重（曲风全 0）时：每批先塞 1 首「别的曲风」，
  // 否则纯相似推荐会一路同语种、同风格（英文歌后面全是英文歌）。
  if (!weighted.length && !blockInst) {
    let names
    if (monoLang) {
      // 连着 3 首同语种：优先直接换成别的语种（英文 → 华语/日语/韩语…）
      const others = Object.keys(LANG_GENRES).filter(l => l !== monoLang)
      const pickLang = others[Math.floor(Math.random() * others.length)]
      names = shuffle((LANG_GENRES[pickLang] || []).slice())
    } else {
      names = shuffle(CONTRAST_GENRES.filter(g => !(LANG_GENRES[monoLang] || []).includes(g)).slice())
    }
    for (const g of names.slice(0, 2)) {
      if (picked.length >= 1) break
      await genreStep(g, 1)
    }
  }

  // 上一首是纯音乐：先换两个「反差曲风」补味道，别顺着 simiSong 继续纯音乐
  if (blockInst && picked.length < need) {
    const names = weighted.length ? shuffle(weighted.map(g => g.name)) : shuffle(CONTRAST_GENRES.slice())
    for (const g of names.slice(0, 2)) {
      if (picked.length >= need) break
      await genreStep(g, need)
    }
  }

  // 曲风没填满就用「相似歌曲」补齐（没有设置曲风时这就是主体来源）
  if (picked.length < need) await simiStep()
  if (picked.length < need) await artistStep()

  // 兜底：几大官方榜单混着取（冷启动，或者上面都没取到）
  // 单个榜单只有几十首，听久了会被去重吃干净，所以轮流从三个榜单里抽
  if (picked.length < need) {
    const sources = COLD_PLAYLISTS.slice()
    shuffle(sources)
    for (const pid of sources) {
      if (picked.length >= need) break
      try {
        const tracks = await fetchPlaylistTracks(operation, pid, 60)
        const list = shuffle(tracks.map(toEntity).filter(Boolean))
        for (const e of list) {
          if (accept(e)) break
        }
      } catch (e) {
        log('warn', '榜单兜底失败 ' + pid, msg(e))
      }
    }
  }

  // 过滤太狠一首都没凑齐：放宽一次（允许纯音乐 / 同名歌手），总比不补歌强
  if (!picked.length && (blockInst || need > 0)) {
    relax = true
    if (picked.length < need) await simiStep()
    if (picked.length < need) await artistStep()
  }

  return picked
}

/** 把候选池补到 POOL_TARGET 首（只联网，不动队列） */
async function fillPool(operation) {
  if (mem.filling) return
  mem.filling = true
  try {
    let guard = 0
    while (mem.pool.length < POOL_TARGET && guard < 6) {
      guard++
      const want = Math.min(12, POOL_TARGET - mem.pool.length)
      const items = await buildCandidates(operation, want)
      if (!items.length) break
      for (const e of items) {
        if (!mem.pool.some(p => keyOf(p) === keyOf(e))) mem.pool.push(e)
      }
      if (items.length < want) break
    }
    log('debug', '候选池', { size: mem.pool.length })
  } catch (e) {
    mem.error = msg(e)
    log('warn', '填充候选池失败', msg(e))
  } finally {
    mem.filling = false
  }
}

/**
 * 从候选池里取 n 首追加到队列——**不联网**，所以点下一曲再快也追得上。
 * 池子不够时才现场构造（会慢一点）。
 */
async function drainToQueue(operation, n, options) {
  const opts = options || {}
  const want = Math.max(1, n)

  // 正常路径只用池子里现成的歌：不联网，追加才能在几十毫秒内完成。
  // 但池子是「顺着上一颗种子」攒的：这轮要避开纯音乐 / 避开连着同语种时，池子里那些就不能用。
  const recentLangs = (mem.lastLangs || []).slice(-3)
  const queueLangs = (mem.queueLangs || []).slice(-3)
  const monoOf = arr =>
    arr.length >= 3 && arr.every(l => l === arr[0]) && arr[0] !== 'other' ? arr[0] : ''
  const monoLang = monoOf(queueLangs) || monoOf(recentLangs)

  let items = []
  if (mem.instSkip > 0 || monoLang) {
    const recentArtists = new Set(mem.lastArtists.slice(-4))
    const usable = mem.pool.filter(e => {
      if (mem.instSkip > 0 && isInstrumental(e)) return false
      if (monoLang && langOf(e) === monoLang) return false
      if (recentArtists.has(artistOf(e))) return false
      if (playedRecently(songKeyOf(e))) return false
      return true
    })
    if (usable.length) {
      items = usable.slice(0, want)
      mem.pool = mem.pool.filter(e => !items.includes(e))
    } else if (mem.pool.length) {
      // 池子里没有符合「换味道」条件的歌：先拿现成的不让队列断粮（几十毫秒内完成），
      // 同时后台按新条件重攒池子。宁可这一批不合口味，也不能卡着不补。
      items = mem.pool.splice(0, Math.min(want, mem.pool.length))
      log('debug', '池子无匹配，先放宽取现成', { want, taken: items.length })
      mem.pool = []
      fillPool(operation).catch(() => {})
    }
  } else {
    // 优先拿「最近 7 天没听过」的；池子里全听过就退回用现成的（总比不补歌强）
    const fresh = mem.pool.filter(e => !playedRecently(songKeyOf(e)))
    const src = fresh.length ? fresh : mem.pool
    items = src.slice(0, Math.min(want, src.length))
    mem.pool = mem.pool.filter(e => !items.includes(e))
  }

  if (!items.length) {
    // 池子空了：现场构造（会慢一点，但味道是对的）
    try {
      items = await buildCandidates(operation, want)
    } catch (e) {
      log('warn', '现场补候选失败', msg(e))
      mem.error = msg(e)
    }
  }

  // 最后一道去重：按 songId + 「歌名+歌手」指纹双保险
  // （池子是提前攒的，攒完之后才追加的歌它不知道，所以必须在这里再拦一次）
  const pushed = new Set(mem.appended.slice(-300))
  const pushedSongs = new Set((mem.recentSongs || []).slice(-300))
  const beforeFilter = items.length
  items = items.filter(e => {
    const key = keyOf(e)
    if (pushed.has(key)) return false
    const sk = songKeyOf(e)
    if (pushedSongs.has(sk)) return false
    pushed.add(key)
    pushedSongs.add(sk)
    return true
  })
  if (items.length < beforeFilter) {
    log('debug', '去重过滤', { dropped: beforeFilter - items.length })
  }
  if (!items.length) {
    log('warn', '这一轮没有可推荐的歌（大概率是被去重吃掉了）')
    return []
  }

  await host.queue.append(items, call(operation, PERM_CTL))

  mem.appended = mem.appended.concat(items.map(keyOf)).slice(-400)
  mem.seedId = String(items[items.length - 1].ref.id) // 下一批从本批最后一首继续“漂”
  mem.batch = items.concat(mem.batch).slice(0, 40)

  // 记下这几个歌手，下一批别再是同一个人；如果这批里带了纯音乐，接下来 3 批换味道
  for (const e of items) {
    const ar = artistOf(e)
    if (ar && mem.lastArtists[mem.lastArtists.length - 1] !== ar) mem.lastArtists.push(ar)
  }
  mem.lastArtists = mem.lastArtists.slice(-12)
  mem.recentSongs = items.map(songKeyOf).concat(mem.recentSongs).slice(0, 200)
  mem.lastLangs = items.map(langOf).concat(mem.lastLangs).slice(0, 12)
  if (items.some(isInstrumental)) {
    if (mem.instSkip < 3) mem.instSkip = 3
  } else if (mem.instSkip > 0) {
    mem.instSkip--
  }
  log('debug', '本批曲目', {
    titles: items.map(e => String(e.title || '')),
    inst: items.some(isInstrumental),
    instSkip: mem.instSkip,
  })
  mem.lastRun = Date.now()
  mem.lastCount = items.length
  mem.error = ''
  saveSoon() // 不 await：持久化慢的话会拖住下一次补歌

  // 池子见底了才在后台补，别阻塞本次追加（别每次补歌都去联网，省带宽也省 CPU）
  if (mem.pool.length < POOL_MIN) {
    fillPool(operation).catch(() => {})
  }

  // 只有「可能已经唱到队尾」时才去读播放状态并接管播放；
  // 队列里还有歌的时候这两次 IPC 纯属浪费（每次省 ~50–100ms）
  if (opts.play && opts.wasAtEnd) {
    try {
      const st = await readPlayer(operation)
      const q = await readQueue(operation)
      const wrapped =
        q.items.length > 0 &&
        q.currentIndex === 0 &&
        keyOf(q.items[0]) !== keyOf(items[0])
      const shouldStart = wrapped || !st || st.status === 'ended'
      if (shouldStart) await host.player.play(items[0].ref, call(operation, PERM_CTL))
    } catch (e) {
      log('warn', '开始播放失败', msg(e))
    }
  } else if (opts.play && opts.firstRun) {
    // 开局时队列可能还是空的，直接起播
    try {
      await host.player.play(items[0].ref, call(operation, PERM_CTL))
    } catch (e) {
      log('warn', '开始播放失败', msg(e))
    }
  }

  return items
}

async function lockSequential(operation) {
  try {
    // 顺序播放 = 不随机 + 不循环（repeat off）；队列不会再"绕回第一首"
    await host.player.setMode(
      { repeat: 'off', shuffle: false },
      call(operation, PERM_CTL),
    )
  } catch (e) {
    log('debug', '播放模式设置失败', msg(e))
  }
}

/**
 * 校正播放模式：只要还是「列表循环/随机」，就拉回顺序播放。
 * 用户自己点的「单曲循环」保持不动。
 */
async function enforceMode(operation) {
  try {
    const st = await readPlayer(operation)
    if (!st) return
    if (st.repeat === 'one') return
    if (st.repeat === 'all' || st.shuffle) {
      await host.player.setMode(
        { repeat: 'off', shuffle: false },
        call(operation, PERM_CTL),
      )
      log('info', '已把播放模式拉回顺序播放', { repeat: st.repeat, shuffle: st.shuffle })
    }
  } catch (e) {
    log('debug', '校正播放模式失败', msg(e))
  }
}

async function tick(operation, options) {
  await load()
  if (!mem.enabled) return { skipped: 'disabled' }
  // 关键：每分钟用定时任务的新 operation 续一次上下文。
  // 否则用户长时间不点插件、只是听歌时，lastOp 会超过 OP_FRESH_MS（110 秒），
  // 事件补歌全部静默失效，只能等下一次 tick —— 这就是「补歌跟不上」的根因。
  rememberOp(operation)
  if (mem.enabled && !mem.taskOn) await schedule(operation).catch(() => {})
  if (mem.busy) return { skipped: 'busy' }
  mem.busy = true
  try {
    const queue = await readQueue(operation)
    const remain = queue.items.length - (queue.currentIndex + 1)
    log('debug', 'tick 检查', { remain, total: queue.items.length, index: queue.currentIndex, pool: mem.pool.length })
    if (mem.pool.length < POOL_MIN) fillPool(operation).catch(() => {})
    await enforceMode(operation)
    if (remain > AHEAD && !(options && options.force)) {
      return { remain, pool: mem.pool.length }
    }
    const items = await drainToQueue(operation, wantedCount(remain))
    log('info', '补歌成功', { appended: items.length, remain, pool: mem.pool.length })
    return { appended: items.length, remain }
  } finally {
    mem.busy = false
  }
}

// ==== 权限 / 定时任务 ======================================================

async function ensurePermissions(operation) {
  const groups = ['network', 'playbackRead', 'playbackControl', 'background']
  const result = { ok: true, denied: [] }
  for (const group of groups) {
    try {
      const r = await host.permissions.requestGroup({ group })
      const status = r && r.status
      const grants = Array.isArray(r && r.grants) ? r.grants : []
      const allGranted =
        grants.length > 0 && grants.every(g => g.status === 'granted' || g.status === 'restricted')
      if (status !== 'granted' && !allGranted) {
        result.ok = false
        result.denied.push(group)
      }
    } catch (e) {
      log('warn', '请求权限失败 ' + group, msg(e))
      result.ok = false
      result.denied.push(group)
    }
  }
  return result
}

async function schedule(operation) {
  if (mem.taskOn) return true
  try {
    await host.tasks.schedule(
      { id: TASK_ID, commandId: TASK_ID, intervalMs: TICK_MS },
      call(operation, PERM_BG),
    )
    mem.taskOn = true
    log('info', '定时任务已登记', { intervalMs: TICK_MS })
    return true
  } catch (e) {
    mem.taskOn = false
    log('warn', '定时任务不可用，将退化为事件驱动', msg(e))
    return false
  }
}

async function unschedule(operation) {
  if (!mem.taskOn) return
  try {
    await host.tasks.cancel(TASK_ID, call(operation, PERM_BG))
  } catch (e) {
    log('info', '取消定时任务失败', msg(e))
  } finally {
    mem.taskOn = false
  }
}

// ==== 原生页面 =============================================================

function statusText(queueLength) {
  const parts = []
  parts.push(mem.enabled ? '漫游中' : '未开启')
  if (typeof queueLength === 'number' && queueLength > 0) parts.push('队列 ' + queueLength + ' 首')
  if (mem.seedId) parts.push('种子 songId ' + mem.seedId)
  if (mem.lastCount) parts.push('上次补 ' + mem.lastCount + ' 首')
  if (!mem.taskOn) parts.push('后台任务未登记')
  if (mem.error) parts.push('最近错误：' + mem.error)
  return parts.join(' · ')
}

async function renderView(operation) {
  rememberOp(operation)

  // 面板内的「子页面」：宿主只在 renderAction 的返回值里取页面，
  // 其它动作的返回值会被丢弃并重新渲染一次面板，所以子页只能靠标记切换。
  if (mem.page === 'daily') {
    try {
      const items = await buildDaily(operation)
      return dailyView(items)
    } catch (e) {
      log('warn', '渲染每日推荐失败', msg(e))
      mem.page = ''
    }
  }

  const sections = []

  // 1) 真实队列：让面板和播放列表对得上
  let queueItems = []
  let currentIndex = -1
  try {
    const q = await host.queue.get(call(operation, PERM_READ))
    queueItems = (Array.isArray(q && q.items) ? q.items : []).filter(isEntity)
    currentIndex = q && typeof q.currentIndex === 'number' ? q.currentIndex : -1
  } catch (e) {
    log('debug', '面板读取队列失败', msg(e))
  }

  if (queueItems.length) {
    sections.push({
      id: 'queue',
      title: '播放队列（共 ' + queueItems.length + ' 首' +
        (currentIndex >= 0 ? '，当前第 ' + (currentIndex + 1) + ' 首' : '') + '）',
      layout: 'list',
      items: queueItems.slice(0, 200),
      onPlay: 'roam.play',
    })
  }

  // 2) 还没进队列的推荐（面板里单独列出来，避免和队列混在一起）
  const inQueue = new Set(queueItems.map(keyOf))
  const pending = mem.batch.filter(e => !inQueue.has(keyOf(e)))
  if (pending.length) {
    sections.push({
      id: 'batch',
      title: '还没进队列的推荐（点播放会追加进去）',
      layout: 'list',
      items: pending.slice(0, 20),
      onPlay: 'roam.play',
      itemActions: [{ label: '不喜欢', action: 'roam.dislikeItem' }],
    })
  }

  if (!sections.length) {
    sections.push({
      id: 'empty',
      title: '还没有推荐',
      layout: 'list',
      items: [
        {
          ref: { pluginId: PLUGIN_ID, providerId: 'wy', kind: 'track', id: '0', scope: 'provider' },
          title: '点下面的「开始漫游」',
          subtitle: '会基于当前播放的歌曲自动续歌',
          capabilities: ['play'],
          metadata: { artists: ['私人漫游'] },
        },
      ],
    })
  }

  // 3) 曲风：不再在面板里堆歌单封面，统一到设置页用数值调（见 设置 → 插件管理 → 私人漫游 · 曲风权重）
  const activeGenres = weightedGenres().sort((a, b) => b.weight - a.weight)
  const genreText = activeGenres.length
    ? ' · 曲风：' + activeGenres.slice(0, 5).map(it => it.name + ' ' + it.weight + '%').join(' / ') +
      (activeGenres.length > 5 ? ' 等 ' + activeGenres.length + ' 种' : '')
    : ' · 曲风：未设置（纯相似推荐）'

  return {
    type: 'page',
    title: '私人漫游',
    description: statusText(queueItems.length) + genreText,
    actions: [
      {
        label: mem.enabled ? '停止漫游' : '开始漫游',
        action: mem.enabled ? 'roam.stop' : 'roam.start',
        primary: true,
      },
      { label: '换一批', action: 'roam.refresh' },
      { label: '不喜欢当前这首', action: 'roam.dislike' },
      { label: '每日推荐', action: 'roam.daily' },
      { label: '公告', action: 'roam.help' },
      { label: '曲风权重设置', action: 'roam.openWeights' },
    ],
    sections,
  }
}

// ==== 每日推荐 =============================================================
// 不依赖网易云登录（官方 recommend/songs 需要 Cookie），用本地推荐器每天生成 30 首：
// 先按曲风权重（没设就随机曲风）从歌单里取 20 首，再用官方榜单补满；
// 生成结果按日期缓存在 storage 里，同一天再打开不重新联网。

async function buildDaily(operation, force) {
  const date = todayKey()
  if (!force && mem.daily && mem.daily.date === date && Array.isArray(mem.daily.items) && mem.daily.items.length) {
    return mem.daily.items
  }

  const picked = []
  const seen = new Set()
  const push = e => {
    if (!e) return false
    const k = songKeyOf(e)
    if (seen.has(k)) return false
    if (playedRecently(k)) return false
    if (artistSuppressed(artistOf(e))) return false
    const key = keyOf(e)
    if (seen.has('#' + key)) return false
    seen.add(k)
    seen.add('#' + key)
    picked.push(e)
    return true
  }

  // 1) 按曲风取 20 首：有权重就按权重偏好，没有就随机抽 6 个曲风
  const weighted = weightedGenres()
  const genres = (weighted.length ? weighted.map(g => g.name) : shuffle(GENRES.slice())).slice(0, 6)
  for (const g of genres) {
    if (picked.length >= 20) break
    try {
      const playlists = await fetchGenrePlaylists(operation, g, 10)
      const taps = shuffle(playlists).slice(0, 1)
      for (const p of taps) {
        if (picked.length >= 20) break
        const tracks = await fetchPlaylistTracks(operation, p.id, 50)
        for (const e of shuffle(tracks.map(toEntity).filter(Boolean))) {
          if (picked.length >= 20) break
          push(e)
        }
      }
    } catch (e) {
      log('info', '每日推荐取曲风失败 ' + g, msg(e))
    }
  }

  // 2) 榜单补满 30 首
  for (const pid of shuffle(COLD_PLAYLISTS.slice())) {
    if (picked.length >= DAILY_SIZE) break
    try {
      const tracks = await fetchPlaylistTracks(operation, pid, 60)
      for (const e of shuffle(tracks.map(toEntity).filter(Boolean))) {
        if (picked.length >= DAILY_SIZE) break
        push(e)
      }
    } catch (e) {
      log('info', '每日推荐取榜单失败 ' + pid, msg(e))
    }
  }

  mem.daily = { date, items: picked }
  await save()
  log('info', '生成每日推荐', { date, count: picked.length })
  return picked
}

function dailyView(items) {
  const date = todayKey()
  return {
    type: 'page',
    title: '每日推荐',
    description: date + ' · 共 ' + items.length + ' 首 · 每天 0 点自动换一批（最近 7 天听过的不再出现）',
    actions: [
      { label: '播放全部', action: 'roam.playDaily', primary: true },
      { label: '重新生成', action: 'roam.refreshDaily' },
      { label: '返回漫游面板', action: 'roam.back' },
    ],
    sections: [
      {
        id: 'daily',
        title: '今日 30 首',
        layout: 'list',
        items: items,
        onPlay: 'roam.play',
        itemActions: [{ label: '不喜欢', action: 'roam.dislikeItem' }],
      },
    ],
  }
}


// 使用说明不再用原生页拼文本（原生页只能渲染曲目列表），改成 web surface：
// 见文件末尾 exports.surfaces.help（真实 HTML 文本，没有假按钮）。

// ==== Provider =============================================================
// 宿主规定「插件只能操作自己声明的资源」：queue.append / player.play 收到的曲目，
// 其 ref.pluginId 必须等于本插件 id，且 providerId 必须在本插件清单里声明。
// 所以即使不自己实现音源，也得声明一个 wy provider；播放解析会优先交给你在
// 「插件路由」里选择的实现（例如聆澜音源），只有路由到本插件时才走下面的兜底。

async function providerResolve(ref, quality, operation) {
  // 每次播放都会走到这里，顺手拿一个新鲜的操作上下文（宿主的操作 120 秒就过期）
  rememberOp(operation)
  const id = String((ref && ref.id) || '')
  if (!/^\d+$/.test(id)) {
    return host.playback.failure({ code: 'NOT_FOUND', message: '无效的歌曲 ID' })
  }
  const url = 'https://music.163.com/song/media/outer/url?id=' + id + '.mp3'
  return {
    ok: true,
    url,
    requestHeaders: {
      'User-Agent': UA,
      Referer: 'https://music.163.com/',
    },
  }
}

async function providerLyrics(ref) {
  return { format: 'crlyric', version: 1, track: ref, offsetMs: 0, lines: [] }
}

// ==== 插件入口 =============================================================

// 曲风权重设置页（Schema Surface）。
// 宿主支持的表单控件只有 text-input / password / number / toggle / select / text / button，
// 没有滑块控件，所以这里用 number 输入 0–100，配合顶部 text 显示当前配比。
// 注意：安装器要求 exports.resources 下面每个值都是**字面量对象**（不能引用变量），
// 否则报 "Expected literal object"，所以这里整段内联。
exports.resources = {
  'schema.weights': {
    type: 'json',
    value: {
      schemaVersion: '1.0',
      presentation: {
        kind: 'drawer',
        placement: 'right',
        size: 460,
        openAction: 'weights.load',
      },
      root: {
        type: 'form',
        title: '曲风权重',
        submitAction: 'weights.save',
        submitLabel: '保存权重',
        submitInput: { source: 'roam-weights' },
        children: [
          { type: 'button', label: '← 返回漫游面板', action: 'roam.openPanel' },
          { type: 'text', bind: 'summary', label: '当前配比' },
          { type: 'text', bind: 'hint', label: '说明' },
          { type: 'number', bind: 'w_huayu', label: '华语（0–100）' },
          { type: 'number', bind: 'w_oumei', label: '欧美（0–100）' },
          { type: 'number', bind: 'w_riyu', label: '日语（0–100）' },
          { type: 'number', bind: 'w_hanyu', label: '韩语（0–100）' },
          { type: 'number', bind: 'w_yueyu', label: '粤语（0–100）' },
          { type: 'number', bind: 'w_liuxing', label: '流行（0–100）' },
          { type: 'number', bind: 'w_yaogun', label: '摇滚（0–100）' },
          { type: 'number', bind: 'w_minyao', label: '民谣（0–100）' },
          { type: 'number', bind: 'w_gufeng', label: '古风（0–100）' },
          { type: 'number', bind: 'w_dianzi', label: '电子（0–100）' },
          { type: 'number', bind: 'w_wuqu', label: '舞曲（0–100）' },
          { type: 'number', bind: 'w_shuochang', label: '说唱（0–100）' },
          { type: 'number', bind: 'w_jueshi', label: '爵士（0–100）' },
          { type: 'number', bind: 'w_gudian', label: '古典（0–100）' },
          { type: 'number', bind: 'w_jinshu', label: '金属（0–100）' },
          { type: 'number', bind: 'w_pengke', label: '朋克（0–100）' },
          { type: 'number', bind: 'w_landiao', label: '蓝调（0–100）' },
          { type: 'number', bind: 'w_leigui', label: '雷鬼（0–100）' },
          { type: 'number', bind: 'w_xiangcun', label: '乡村（0–100）' },
          { type: 'number', bind: 'w_yinglun', label: '英伦（0–100）' },
          { type: 'number', bind: 'w_houyao', label: '后摇（0–100）' },
          { type: 'number', bind: 'w_qingyinyue', label: '轻音乐（0–100）' },
          { type: 'number', bind: 'w_newage', label: 'New Age（0–100）' },
          { type: 'number', bind: 'w_acg', label: 'ACG（0–100）' },
          { type: 'number', bind: 'w_yingshi', label: '影视原声（0–100）' },
          { type: 'number', bind: 'w_zongyi', label: '综艺（0–100）' },
          { type: 'number', bind: 'w_youxi', label: '游戏（0–100）' },
          { type: 'number', bind: 'w_wangluo', label: '网络歌曲（0–100）' },
          { type: 'number', bind: 'w_fanchang', label: '翻唱（0–100）' },
          {
            type: 'button',
            label: '全部清零',
            action: 'weights.reset',
            input: { scope: 'all' },
          },
        ],
      },
    },
  },
}

exports.activate = async function (core) {
  host = core
  await load()

  // 声明并注册 wy provider（见上方注释：不注册就无法往队列里放歌）
  try {
    host.effects.add(
      host.providers.register('wy', {
        tracks: { resolve: providerResolve, lyrics: providerLyrics },
      }),
    )
  } catch (e) {
    log('error', '注册 provider 失败', msg(e))
  }

  const reg = (id, handler) => {
    try {
      core.effects.add(core.actions.register(id, handler))
    } catch (e) {
      log('error', '注册 action 失败 ' + id, msg(e))
    }
  }

  // —— 开始漫游 ——
  reg('roam.start', async (_input, operation) => {
    rememberOp(operation)
    const perm = await ensurePermissions(operation)
    if (!perm.ok) {
      const text = '缺少权限：' + perm.denied.join('、') + '（请在插件设置里允许）'
      toast(text, 'warning')
      throw new Error(text)
    }
    mem.enabled = true
    const scheduled = await schedule(operation)
    await save()
    await fillPool(operation)
    const st0 = await readPlayer(operation).catch(() => null)
    const q0 = await readQueue(operation).catch(() => ({ items: [], currentIndex: -1 }))
    const remain0 = q0.items.length - (q0.currentIndex + 1)
    if (!q0.items.length) {
      // 空队列重新开始：丢掉上一轮的种子和候选池，避免一路顺着旧种子漂到纯音乐
      mem.seedId = ''
      mem.pool = []
    }
    const items = await drainToQueue(operation, wantedCount(remain0), {
      play: true,
      firstRun: !st0 || st0.status === 'idle' || st0.status === 'ended',
    })
    await lockSequential(operation)
    toast(
      scheduled
        ? '私人漫游已开启，队列快放完时会自动续歌'
        : '私人漫游已开启（后台定时不可用，切歌时会尽量续歌）',
      'success',
    )
    return { enabled: true, appended: items.length, scheduled }
  })

  // —— 停止漫游 ——
  reg('roam.stop', async (_input, operation) => {
    rememberOp(operation)
    mem.enabled = false
    await unschedule(operation)
    await save()
    toast('私人漫游已停止', 'info')
    return { enabled: false }
  })

  // —— 换一批 ——
  reg('roam.refresh', async (_input, operation) => {
    rememberOp(operation)
    mem.busy = false
    if (mem.enabled && !mem.taskOn) await schedule(operation).catch(() => {})
    const items = await drainToQueue(operation, BATCH)
    toast('已追加 ' + items.length + ' 首推荐', 'success')
    return { appended: items.length }
  })

  // —— 不喜欢（当前播放的这首）——
  reg('roam.dislike', async (_input, operation) => {
    rememberOp(operation)
    const player = await readPlayer(operation)
    const entity = (player && player.track) || mem.batch[0] || null
    const id = trackIdOf(entity) || (entity && entity.ref ? String(entity.ref.id) : '')
    if (!id) throw new Error('没有可标记的歌曲')
    if (!mem.disliked.includes(id)) mem.disliked.push(id)
    mem.batch = mem.batch.filter(e => String(e.ref.id) !== id)

    // 负反馈两级：这首歌永久拉黑 + 这位歌手冷静 14 天（比只拉黑单曲更有效）
    const ar = artistOf(entity)
    if (ar && !mem.dislikedArtists.some(a => a.name === ar)) {
      mem.dislikedArtists = mem.dislikedArtists.concat([{ name: ar, at: Date.now() }]).slice(-200)
    }
    await save()
    try {
      await host.player.next(call(operation, PERM_CTL))
    } catch (e) {
      log('info', '切歌失败（可能已是最后一首）', msg(e))
    }
    if (mem.enabled) {
      try {
        await tick(operation, { force: true })
      } catch (e) {
        log('warn', '补歌失败', msg(e))
      }
    }
    toast(ar ? '已减少「' + ar + '」这类推荐（14 天内不再出现）' : '已减少这类推荐', 'success')
    return { disliked: id, artist: ar || '', total: mem.disliked.length }
  })

  // —— 原生页里的单曲不喜欢 ——
  reg('roam.dislikeItem', async (input, operation) => {
    rememberOp(operation)
    const ref = input && input.ref
    const id = ref ? String(ref.id) : ''
    if (!id) throw new Error('缺少歌曲信息')
    if (!mem.disliked.includes(id)) mem.disliked.push(id)
    mem.batch = mem.batch.filter(e => String(e.ref.id) !== id)
    if (mem.daily && Array.isArray(mem.daily.items)) {
      mem.daily.items = mem.daily.items.filter(e => String(e.ref.id) !== id)
    }
    const ar = (input && input.artist) || (ref && ref.subtitle) || ''
    if (ar && !mem.dislikedArtists.some(a => a.name === ar)) {
      mem.dislikedArtists = mem.dislikedArtists.concat([{ name: ar, at: Date.now() }]).slice(-200)
    }
    await save()
    toast('已减少「' + ((ref && ref.title) || '这首') + '」这类推荐', 'success')
    return { disliked: id }
  })

  // —— 每日推荐 ——
  reg('roam.daily', async (_input, operation) => {
    rememberOp(operation)
    mem.page = 'daily'
    // 面板里的按钮：只切页，页面本身由 roam.view 在重渲染时给出
    return { page: 'daily' }
  })
  reg('roam.dailyView', async (_input, operation) => {
    // 侧边栏「每日推荐」独立页面的渲染动作
    rememberOp(operation)
    const items = await buildDaily(operation)
    return dailyView(items)
  })
  reg('roam.refreshDaily', async (_input, operation) => {
    rememberOp(operation)
    const items = await buildDaily(operation, true)
    toast('已重新生成今日 ' + items.length + ' 首', 'success')
    return dailyView(items)
  })
  reg('roam.playDaily', async (_input, operation) => {
    rememberOp(operation)
    const items = await buildDaily(operation)
    if (!items.length) throw new Error('今天的推荐还没生成出来，稍后再试')
    await host.queue.append(items, call(operation, PERM_CTL))
    try {
      await host.player.play(items[0].ref, call(operation, PERM_CTL))
    } catch (e) {
      log('warn', '播放每日推荐失败', msg(e))
    }
    mem.appended = mem.appended.concat(items.map(keyOf)).slice(-400)
    mem.recentSongs = items.map(songKeyOf).concat(mem.recentSongs).slice(0, 200)
    saveSoon()
    toast('已把今日 ' + items.length + ' 首加进队列', 'success')
    return { count: items.length }
  })

  // —— 公告 / 使用说明：打开独立的 web 页面（真实文本，不是曲目列表）——
  reg('roam.help', async (_input, operation) => {
    rememberOp(operation)
    try {
      await host.ui.openView('help')
    } catch (e) {
      log('warn', '打开使用说明失败', msg(e))
      toast('打开使用说明失败：' + msg(e), 'warning')
    }
    return { opened: 'help' }
  })

  // —— 从说明页回到漫游面板 ——
  reg('roam.openPanel', async (_input, operation) => {
    rememberOp(operation)
    mem.page = ''
    // 先把叠在上面的抽屉（说明页 / 曲风权重）关掉，再打开漫游面板，避免两个抽屉叠着
    for (const id of ['help', 'weights']) {
      try {
        await host.ui.closeView(id)
      } catch (e) {
        /* 没开着就算了 */
      }
    }
    try {
      await host.ui.openView('roam')
    } catch (e) {
      log('warn', '打开漫游面板失败', msg(e))
    }
    return { opened: 'roam' }
  })

  // —— 返回漫游面板 / 打开面板时复位 ——
  reg('roam.back', async (_input, operation) => {
    rememberOp(operation)
    mem.page = ''
    return { back: true }
  })
  reg('roam.reset', async (_input, operation) => {
    rememberOp(operation)
    mem.page = ''
    return { reset: true }
  })

  // —— 原生页调整曲风权重（卡片上的 + / − 按钮，点卡片本身也算 +10%）——
  function genreFromInput(input) {
    const raw = (input && input.genre) ||
      ((input && input.ref && input.ref.id) ? String(input.ref.id) : '')
    const name = String(raw).replace(/^genre:/, '')
    if (GENRES.indexOf(name) < 0) throw new Error('未知曲风：' + name)
    return name
  }

  function bumpGenre(input, delta) {
    const name = genreFromInput(input)
    const next = Math.max(0, Math.min(100, (Number(mem.weights[name]) || 0) + delta))
    if (next === 0) delete mem.weights[name]
    else mem.weights[name] = next
    return { name, value: next }
  }

  reg('roam.genreUp', async (input, operation) => {
    rememberOp(operation)
    const r = bumpGenre(input, 10)
    mem.pool = [] // 权重变了，重新备候选
    saveSoon()
    if (mem.enabled) fillPool(operation).catch(() => {})
    toast(r.name + '：' + r.value + '%', 'info')
    return { genre: r.name, weight: r.value }
  })

  reg('roam.genreDown', async (input, operation) => {
    rememberOp(operation)
    const r = bumpGenre(input, -10)
    mem.pool = []
    saveSoon()
    if (mem.enabled) fillPool(operation).catch(() => {})
    toast(r.name + '：' + r.value + '%', 'info')
    return { genre: r.name, weight: r.value }
  })

  reg('roam.genreClear', async (_input, operation) => {
    rememberOp(operation)
    mem.weights = {}
    mem.pool = []
    saveSoon()
    toast('已清空曲风权重，回到纯相似推荐', 'info')
    return { cleared: true }
  })

  // —— 设置页：曲风权重（Schema Surface）——
  function weightsSummary() {
    const active = weightedGenres().sort((a, b) => b.weight - a.weight)
    if (!active.length) return '全部为 0（走纯相似推荐）'
    return active.map(it => it.name + ' ' + it.weight + '%').join(' · ')
  }

  async function publishWeights(status) {
    const state = {
      summary: weightsSummary(),
      hint: status || '数值越大，这个曲风出现在推荐里的比例越高；0 表示不要',
    }
    for (let i = 0; i < GENRES.length; i++) {
      state['w_' + GENRE_KEYS[i]] = Number(mem.weights[GENRES[i]]) || 0
    }
    try {
      await host.ui.setState('weights', state)
    } catch (e) {
      log('debug', '设置页状态发布失败', msg(e))
    }
    return state
  }

  reg('roam.openWeights', async (_input, operation) => {
    rememberOp(operation)
    try {
      await host.ui.openView('weights')
      return { opened: true }
    } catch (e) {
      log('info', '打开设置页失败', msg(e))
      toast('请在「设置 → 插件管理 → 私人漫游 · 曲风权重」里调整', 'info')
      return { opened: false }
    }
  })

  reg('weights.load', async (_input, operation) => {
    rememberOp(operation)
    await load()
    return publishWeights('已载入当前权重')
  })

  reg('weights.save', async (input, operation) => {
    rememberOp(operation)
    if (!input || input.source !== 'roam-weights') throw new Error('保存来源无效')
    const next = {}
    for (let i = 0; i < GENRES.length; i++) {
      const g = GENRES[i]
      const raw = input['w_' + GENRE_KEYS[i]]
      let n = Number(raw)
      if (!Number.isFinite(n)) n = 0
      n = Math.max(0, Math.min(100, Math.round(n)))
      if (n > 0) next[g] = n
    }
    mem.weights = next
    mem.pool = []
    await save()
    if (mem.enabled) fillPool(operation).catch(() => {})
    toast('曲风权重已保存：' + weightsSummary(), 'success')
    return publishWeights('已保存')
  })

  reg('weights.reset', async (_input, operation) => {
    rememberOp(operation)
    mem.weights = {}
    mem.pool = []
    await save()
    toast('已清空曲风权重', 'info')
    return publishWeights('已全部清零')
  })


  reg('roam.play', async (input, operation) => {
    rememberOp(operation)
    const ref = input && input.ref
    const id = ref ? String(ref.id) : ''
    const target = mem.batch.find(e => String(e.ref.id) === id)
    if (!target) throw new Error('这首不在推荐列表里')
    const callCtl = call(operation, PERM_CTL)
    const queue = await readQueue(operation)
    const exists = queue.items.some(
      it => isEntity(it) && it.ref.providerId === 'wy' && String(it.ref.id) === id,
    )
    if (!exists) await host.queue.append([target], callCtl)
    await host.player.play(target.ref, callCtl)
    return { playing: id }
  })

  // —— 后台定时任务 ——
  reg(TASK_ID, async (_input, operation) => {
    rememberOp(operation)
    try {
      const r = await tick(operation)
      return r
    } catch (e) {
      mem.error = dropDeadOp(e)
      log('warn', '定时补歌失败', mem.error)
      return { error: mem.error }
    }
  })

  // —— 原生页渲染 ——
  reg('roam.view', async (_input, operation) => renderView(operation))


  // —— 事件：队列一变就检查，立刻从候选池补歌（不联网，所以点得再快也追得上） ——
  let lastDrainAt = 0
  let lastPlayerCheckAt = 0

  const tryDrain = (remain, from) => {
    if (!mem.enabled) return
    if (mem.busy) {
      // 正在补歌时又来一个事件：记下来，等这一轮结束再判一次，别把事件丢掉
      mem.pendingDrain = { remain, from }
      return
    }
    if (remain > AHEAD) return
    if (!lastOp || Date.now() - lastOpAt > OP_FRESH_MS) return
    if (Date.now() - lastDrainAt < 60) return
    lastDrainAt = Date.now()
    mem.busy = true
    drainToQueue(lastOp, wantedCount(remain), {
      play: true,
      wasAtEnd: remain <= 0,
    })
      .then(items => {
        log('info', '事件补歌', { appended: items.length, remain, from })
        if (mem.pool.length < POOL_MIN) fillPool(lastOp).catch(() => {})
      })
      .catch(e => log('warn', '事件补歌失败', dropDeadOp(e)))
      .then(() => {
        mem.busy = false
        const pend = mem.pendingDrain
        mem.pendingDrain = null
        if (pend && mem.enabled) {
          setTimeout(() => {
            if (!mem.enabled || !lastOp) return
            readQueue(lastOp)
              .then(q => tryDrain(q.items.length - (q.currentIndex + 1), 'pending'))
              .catch(() => {})
          }, 30)
        }
      })
  }

  const onQueueChanged = state => {
    try {
      const q = state || {}
      const items = Array.isArray(q.items) ? q.items : []
      const idx = typeof q.currentIndex === 'number' ? q.currentIndex : -1

      // 队列被清空 = 从头开始：丢掉上一轮的种子和候选池。
      // 否则池子里那批「上一轮的纯音乐」会立刻被补回队列，看起来就像"清空了还在推纯音乐"。
      if (!items.length) {
        if (mem.pool.length || mem.seedId) {
          log('info', '队列已清空，重置种子与候选池')
        }
        mem.seedId = ''
        mem.pool = []
      }

      // 记下「正在播的这几首是什么语言」：连续 3 首同语种时下一批强制换语种
      try {
        mem.queueLangs = items
          .slice(Math.max(0, idx - 2), idx + 1)
          .filter(isEntity)
          .map(langOf)
      } catch (_) {
        /* ignore */
      }

      tryDrain(items.length - (idx + 1), 'queue.changed')
    } catch (e) {
      log('debug', '队列事件处理失败', msg(e))
    }
  }

  // player.changed 播放中每 5 秒来一次，这里只是兜底（queue.changed 没来时用）
  const onPlayerChanged = state => {
    // 记一笔「最近听过」：7 天内听过的歌不再推荐（也就是你要的“热门但不重复”）
    try {
      const track = state && state.track
      if (track && track.ref) {
        const k = songKeyOf(track)
        const last = mem.plays[mem.plays.length - 1]
        if (!last || last.k !== k) {
          mem.plays = mem.plays.concat([{ k, at: Date.now() }]).slice(-600)
          saveSoon()
        }
      }
    } catch (_) {
      /* ignore */
    }

    if (!mem.enabled || mem.busy) return

    // 用户切到一首纯音乐：立刻标记「接下来 3 批换味道」。
    // 这一步在节流之前做——玩家手动点一首钢琴曲，最需要马上生效。
    try {
      const track = state && state.track
      if (track && isInstrumental(track)) {
        if (mem.instSkip < 3) {
          mem.instSkip = 3
          log('debug', '切到纯音乐，后续批次换味道', { title: String(track.title || '') })
        }
      }
    } catch (e) {
      /* 判断失败就当没发生 */
    }

    if (Date.now() - lastPlayerCheckAt < 250) return
    if (!lastOp || Date.now() - lastOpAt > OP_FRESH_MS) return
    lastPlayerCheckAt = Date.now()
    readQueue(lastOp)
      .then(q => tryDrain(q.items.length - (q.currentIndex + 1), 'player.changed'))
      .catch(() => {})
  }

  try {
    core.effects.add(core.events.on('queue.changed', onQueueChanged))
    core.effects.add(core.events.on('player.changed', onPlayerChanged))
  } catch (e) {
    log('warn', '订阅播放事件失败', msg(e))
  }

  // 插件重载后如果上次是开启状态，等下一次任意操作时自动把定时任务接回来
  log('info', '已加载', { enabled: mem.enabled })
}

// ==== Web Surface：使用说明 ================================================
// 这一段运行在隔离的 iframe 里，函数会被序列化过去，因此必须完全自包含：
// 不能引用上面的任何变量或函数。
exports.surfaces = {
  help: async function (ui) {
    const style = document.createElement('style')
    style.textContent = [
      ':root { color-scheme: light dark; }',
      'body { margin: 0; }',
      '.wrap { padding: 22px 26px 40px; font: 14px/1.75 system-ui, "Microsoft YaHei", sans-serif; }',
      'h1 { font-size: 20px; margin: 0 0 4px; }',
      '.sub { opacity: .6; font-size: 12px; margin-bottom: 22px; }',
      'h2 { font-size: 15px; margin: 26px 0 10px; padding-bottom: 6px; border-bottom: 1px solid rgba(127,127,127,.22); }',
      'p { margin: 0 0 10px; }',
      'b { font-weight: 600; }',
      '.tip { padding: 10px 12px; border-radius: 8px; background: rgba(64,158,255,.10); margin: 0 0 10px; }',
      'ul { margin: 0 0 10px; padding-left: 20px; }',
      'li { margin: 0 0 6px; }',
      '.muted { opacity: .65; font-size: 12px; }',
      '.head { position: sticky; top: 0; z-index: 2; padding: 12px 26px; backdrop-filter: blur(8px); background: rgba(127,127,127,.08); border-bottom: 1px solid rgba(127,127,127,.18); }',
      '.back { font: inherit; font-size: 13px; padding: 6px 14px; border-radius: 8px; cursor: pointer; border: 1px solid rgba(127,127,127,.35); background: transparent; color: inherit; }',
      '.back:hover { background: rgba(127,127,127,.16); }',
    ].join('\n')

    const wrap = document.createElement('div')
    wrap.className = 'wrap'
    wrap.innerHTML = [
      '<h1>私人漫游 · 使用说明</h1>',
      '<div class="sub">v0.2.0 · 像网易云私人漫游一样，队列快放完时自动续歌</div>',

      '<h2>一分钟上手</h2>',
      '<p><b>① 点「开始漫游」</b>：用当前正在播放的歌当种子，立刻补 3 首进队列并开始播放。</p>',
      '<p><b>② 之后什么都不用管</b>：队列里剩 5 首时会自动补 3 首，始终保留 5–8 首余量，可以一直听下去。</p>',
      '<p><b>③ 想换口味</b>：点「换一批」立刻追加 3 首；点「不喜欢当前这首」跳过并减少同类。</p>',
      '<p><b>④ 想按曲风听</b>：进「曲风权重设置」，给喜欢的曲风拉 0–100 的数值，保存后立刻生效。</p>',

      '<h2>面板上每个按钮</h2>',
      '<ul>',
      '<li><b>开始 / 停止漫游</b>：开关自动续歌。停止后已经进了队列的歌不会被删掉。</li>',
      '<li><b>换一批</b>：马上追加 3 首新推荐，不会清空现有队列。</li>',
      '<li><b>不喜欢当前这首</b>：这首歌永久拉黑；它的歌手 14 天内不再出现；并自动切到下一首。</li>',
      '<li><b>每日推荐</b>：打开今天这 30 首，可「播放全部」一次性加进队列。</li>',
      '<li><b>曲风权重设置</b>：29 个曲风，每个 0–100，按比例混合；全 0 就是纯相似推荐。</li>',
      '<li><b>公告（本页）</b>：插件卡片「⋯」菜单里也能打开。</li>',
      '</ul>',

      '<h2>曲风权重怎么算</h2>',
      '<p><b>数值是相对比例，不是百分比。</b>例如 流行 100 + 古风 50，大约每 3 首里 2 首流行、1 首古风。</p>',
      '<p><b>0 表示完全不选这个曲风。</b>想让某一种多一点，把别的调低比把它拉满更有效。</p>',
      '<p><b>全 0 时也不是死板的纯相似。</b>每批仍会先插 1 首来自其他曲风歌单的歌，避免越听越窄。</p>',
      '<p><b>保存后候选池会重建。</b>如果正在播放，重攒需要几秒钟，期间照常补歌不受影响。</p>',

      '<h2>注意事项（重要）</h2>',
      '<div class="tip">必须先启用一个「网易云音乐（wy）」音源插件（本机的聆澜音源即可）。本插件只负责推荐什么，播放交给音源。</div>',
      '<ul>',
      '<li><b>不需要登录</b>：走的是网易云公开 web 接口；接口有变动时可能需要我更新插件。</li>',
      '<li><b>纯音乐识别是猜的</b>：靠标题 / 专辑 / 歌手里的关键词（钢琴、八音盒、贵族乐团…）判断，偶尔会误判或漏判。</li>',
      '<li><b>最近 7 天听过的不再推荐</b>：按实际播放记录算，只记录插件运行期间的播放。</li>',
      '<li><b>同歌去重按歌名比较</b>：翻唱、现场版、不同版权版本会被当成同一首挡掉。</li>',
      '<li><b>每日推荐是本地算法生成</b>：不是网易云官方推荐（官方那套要登录 Cookie），每天 0 点后自动换新。</li>',
      '<li><b>一起听房间里不会生效</b>：宿主禁止插件在房间里改队列。</li>',
      '<li><b>最晚 60 秒内一定补上</b>：后台任务最小周期 1 分钟；正常情况下切歌瞬间就补。</li>',
      '</ul>',

      '<h2>数据与隐私</h2>',
      '<p>曲风权重、黑名单、播放指纹、当日推荐都存在插件私有存储里，只在本机。</p>',
      '<p>不上传任何信息：请求只发往 music.163.com，不经过任何第三方中转。卸载插件会一并清除这些数据。</p>',

      '<h2>附：它怎么工作</h2>',
      '<p class="muted">当前播放歌曲 → 取网易云 songId（本地 / QQ 曲目会用「歌名 + 歌手」搜一首最接近的）→ 相似歌曲 / 歌手热门 / 曲风歌单 / 官方榜单 四个来源混合 → 去重与防漂移过滤 → 追加进队列。播放由你选择的网易云音源解析，本插件不实现音源。</p>',

      '<h2>关于这个插件</h2>',
      '<p>创意与需求：<b>chaochao</b>　·　代码实现：<b>DeepSeek</b></p>',
      '<p class="muted">从「要一个网易云那样的私人漫游」开始，一路加上了曲风权重、每日推荐、不喜欢、防漂移和去重——每条规则都是被真实听歌时遇到的问题逼出来的。</p>',
    ].join('')

    const head = document.createElement('div')
    head.className = 'head'
    const back = document.createElement('button')
    back.className = 'back'
    back.textContent = '← 返回漫游面板'
    back.addEventListener('click', function () {
      Promise.resolve()
        .then(function () { return ui.invoke('roam.openPanel', {}) })
        .catch(function () {})
        .then(function () {
          try { if (typeof ui.close === 'function') ui.close() } catch (e) {}
        })
    })
    head.appendChild(back)

    ui.root.replaceChildren(style, head, wrap)
  },

  // 曲风权重：同样用 web surface，这样「返回」按钮能放在顶部，而不是表单底部的按钮条
  weights: async function (ui) {
    const GROUPS = [
      ['语种', [
        ['huayu', '华语'], ['oumei', '欧美'], ['riyu', '日语'], ['hanyu', '韩语'], ['yueyu', '粤语'],
      ]],
      ['风格', [
        ['liuxing', '流行'], ['yaogun', '摇滚'], ['minyao', '民谣'], ['gufeng', '古风'], ['dianzi', '电子'],
        ['wuqu', '舞曲'], ['shuochang', '说唱'], ['jueshi', '爵士'], ['gudian', '古典'], ['jinshu', '金属'],
        ['pengke', '朋克'], ['landiao', '蓝调'], ['leigui', '雷鬼'], ['xiangcun', '乡村'], ['yinglun', '英伦'],
        ['houyao', '后摇'], ['qingyinyue', '轻音乐'], ['newage', 'New Age'],
      ]],
      ['主题', [
        ['acg', 'ACG'], ['yingshi', '影视原声'], ['zongyi', '综艺'], ['youxi', '游戏'],
        ['wangluo', '网络歌曲'], ['fanchang', '翻唱'],
      ]],
    ]

    const style = document.createElement('style')
    style.textContent = [
      ':root { color-scheme: light dark; }',
      'body { margin: 0; }',
      '.head { position: sticky; top: 0; z-index: 3; display: flex; align-items: center; gap: 12px; padding: 12px 20px; backdrop-filter: blur(8px); background: rgba(127,127,127,.08); border-bottom: 1px solid rgba(127,127,127,.18); }',
      '.back { font: inherit; font-size: 13px; padding: 6px 12px; border-radius: 8px; cursor: pointer; border: 1px solid rgba(127,127,127,.35); background: transparent; color: inherit; }',
      '.back:hover { background: rgba(127,127,127,.16); }',
      '.title { font-size: 14px; font-weight: 600; }',
      '.body { padding: 8px 20px 20px; font: 13px/1.6 system-ui, "Microsoft YaHei", sans-serif; }',
      'h3 { font-size: 12px; font-weight: 600; opacity: .6; margin: 18px 0 8px; letter-spacing: .04em; }',
      '.row { display: flex; align-items: center; gap: 8px; padding: 5px 0; }',
      '.name { flex: 0 0 84px; }',
      '.bar { flex: 1; height: 4px; border-radius: 2px; background: rgba(127,127,127,.25); overflow: hidden; }',
      '.fill { height: 100%; width: 0%; background: #22c55e; transition: width .12s linear; }',
      '.step { width: 26px; height: 26px; line-height: 1; border-radius: 7px; cursor: pointer; border: 1px solid rgba(127,127,127,.3); background: transparent; color: inherit; font-size: 15px; }',
      '.step:hover { background: rgba(127,127,127,.16); }',
      '.num { width: 46px; text-align: center; font: inherit; padding: 4px 0; border-radius: 7px; border: 1px solid rgba(127,127,127,.3); background: transparent; color: inherit; }',
      '.foot { position: sticky; bottom: 0; display: flex; align-items: center; gap: 10px; padding: 12px 20px; backdrop-filter: blur(8px); background: rgba(127,127,127,.08); border-top: 1px solid rgba(127,127,127,.18); }',
      '.primary { font: inherit; font-size: 13px; padding: 8px 18px; border-radius: 8px; border: 0; cursor: pointer; color: #fff; background: #22c55e; }',
      '.ghost { font: inherit; font-size: 13px; padding: 8px 14px; border-radius: 8px; cursor: pointer; border: 1px solid rgba(127,127,127,.35); background: transparent; color: inherit; }',
      '.msg { font-size: 12px; opacity: .7; margin-left: auto; }',
    ].join('\n')

    const head = document.createElement('div')
    head.className = 'head'
    const back = document.createElement('button')
    back.className = 'back'
    back.textContent = '← 返回'
    const title = document.createElement('div')
    title.className = 'title'
    title.textContent = '曲风权重'
    back.addEventListener('click', function () {
      Promise.resolve()
        .then(function () { return ui.invoke('roam.openPanel', {}) })
        .catch(function () {})
        .then(function () { try { ui.close() } catch (e) {} })
    })
    head.appendChild(back)
    head.appendChild(title)

    const body = document.createElement('div')
    body.className = 'body'

    const inputs = {}
    function rowOf(key, label) {
      const row = document.createElement('div')
      row.className = 'row'
      const name = document.createElement('div')
      name.className = 'name'
      name.textContent = label

      const minus = document.createElement('button')
      minus.className = 'step'
      minus.textContent = '−'
      const num = document.createElement('input')
      num.className = 'num'
      num.type = 'number'
      num.min = '0'
      num.max = '100'
      num.step = '5'
      num.value = '0'
      const plus = document.createElement('button')
      plus.className = 'step'
      plus.textContent = '+'

      const bar = document.createElement('div')
      bar.className = 'bar'
      const fill = document.createElement('div')
      fill.className = 'fill'
      bar.appendChild(fill)

      const clamp = function (v) {
        const n = Math.max(0, Math.min(100, Math.round(Number(v) || 0)))
        num.value = String(n)
        fill.style.width = n + '%'
        return n
      }
      num.addEventListener('input', function () { clamp(num.value) })
      minus.addEventListener('click', function () { clamp(Number(num.value) - 5) })
      plus.addEventListener('click', function () { clamp(Number(num.value) + 5) })

      inputs[key] = { get: function () { return clamp(num.value) }, clamp: clamp }

      row.appendChild(name)
      row.appendChild(minus)
      row.appendChild(num)
      row.appendChild(plus)
      row.appendChild(bar)
      return row
    }

    for (let i = 0; i < GROUPS.length; i++) {
      const h = document.createElement('h3')
      h.textContent = GROUPS[i][0]
      body.appendChild(h)
      const list = GROUPS[i][1]
      for (let j = 0; j < list.length; j++) body.appendChild(rowOf(list[j][0], list[j][1]))
    }

    const foot = document.createElement('div')
    foot.className = 'foot'
    const save = document.createElement('button')
    save.className = 'primary'
    save.textContent = '保存权重'
    const reset = document.createElement('button')
    reset.className = 'ghost'
    reset.textContent = '全部清零'
    const msg = document.createElement('div')
    msg.className = 'msg'
    msg.textContent = '数值越大，这个曲风出现得越多；全 0 = 纯相似推荐'
    foot.appendChild(save)
    foot.appendChild(reset)
    foot.appendChild(msg)

    function applyState(state) {
      if (!state) return
      for (const k in inputs) {
        if (Object.prototype.hasOwnProperty.call(state, 'w_' + k)) inputs[k].clamp(state['w_' + k])
      }
      if (state.summary) msg.textContent = '当前：' + state.summary
    }

    // 桥接层可能把结果包一层 { value: ... }，统一拆掉
    function unwrap(r) {
      if (r && typeof r === 'object' && !Array.isArray(r) && Object.prototype.hasOwnProperty.call(r, 'value')) {
        return r.value
      }
      return r
    }

    save.addEventListener('click', function () {
      const payload = { source: 'roam-weights' }
      for (const k in inputs) payload['w_' + k] = inputs[k].get()
      save.disabled = true
      Promise.resolve()
        .then(function () { return ui.invoke('weights.save', payload) })
        .then(function (r) { r = unwrap(r); applyState(r); msg.textContent = '已保存' + (r && r.summary ? '：' + r.summary : '') })
        .catch(function (e) { msg.textContent = '保存失败：' + (e && e.message ? e.message : e) })
        .then(function () { save.disabled = false })
    })

    reset.addEventListener('click', function () {
      Promise.resolve()
        .then(function () { return ui.invoke('weights.reset', {}) })
        .then(function (r) { r = unwrap(r); applyState(r); msg.textContent = '已全部清零（纯相似推荐）' })
        .catch(function (e) { msg.textContent = '清零失败：' + (e && e.message ? e.message : e) })
    })

    ui.root.replaceChildren(style, head, body, foot)

    Promise.resolve()
      .then(function () { return ui.invoke('weights.load', {}) })
      .then(function (r) { applyState(unwrap(r)) })
      .catch(function () {})
  },
}
