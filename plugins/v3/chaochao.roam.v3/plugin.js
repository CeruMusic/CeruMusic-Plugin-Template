exports.manifest = {
  manifestVersion: 3,
  id: "chaochao.roam.v3",
  name: "私人漫游 V3",
  version: "0.7.3",
  description: "像私人漫游一样，基于当前播放的歌曲在不同音乐源之间持续推荐，队列快放完时自动续歌，可以一直听下去。",
  author: "DeepSeek × chaochao",
  dataSchemas: { config: 1, state: 1 },
  engines: { hostApi: "^3.0.0", logicRuntime: "ceru-js@1" },
  entry: {
    logic: { module: "logic.main" },
    views: [
      { id: "roam", kind: "native", module: "roam.view", title: "私人漫游" },
      { id: "daily", kind: "native", module: "roam.dailyView", title: "每日推荐" },
      {
        id: "weights",
        kind: "web",
        module: "view.weights",
        title: "曲风权重",
        presentation: { kind: "drawer", placement: "right", size: 540 }
      },
      {
        id: "help",
        kind: "web",
        module: "view.help",
        title: "使用说明",
        presentation: { kind: "drawer", placement: "right", size: 760 }
      }
    ]
  },
  provides: {
    actions: [
      { id: "roam.view", title: "漫游面板" },
      { id: "roam.dailyView", title: "每日推荐页面" },
      { id: "roam.start", title: "开始漫游" },
      { id: "roam.stop", title: "停止漫游" },
      { id: "roam.refresh", title: "换一批推荐" },
      { id: "roam.dislike", title: "不喜欢当前这首" },
      { id: "roam.dislikeItem", title: "不喜欢某条推荐" },
      { id: "roam.play", title: "播放这条推荐" },
      { id: "roam.daily", title: "打开每日推荐" },
      { id: "roam.refreshDaily", title: "重新生成每日推荐" },
      { id: "roam.playDaily", title: "播放每日推荐" },
      { id: "roam.back", title: "返回漫游面板" },
      { id: "roam.reset", title: "复位漫游面板" },
      { id: "roam.openPanel", title: "打开漫游面板" },
      { id: "roam.help", title: "打开使用说明" },
      { id: "roam.openWeights", title: "打开曲风权重" },
      { id: "weights.load", title: "读取曲风权重" },
      { id: "weights.save", title: "保存曲风权重" },
      { id: "weights.reset", title: "清空曲风权重" },
      { id: "roam.snapshot", title: "读取漫游状态" },
      { id: "roam.sources.refresh", title: "重新扫描音乐源" }
    ]
  },
  uses: {
    permissions: [
      {
        key: "roam.music.read",
        name: "music.read",
        reason: "读取你已启用音乐源的搜索结果与排行榜，用来挑选下一首"
      },
      {
        key: "roam.music.control",
        name: "music.control",
        reason: "把选中的推荐写进播放队列"
      },
      {
        key: "roam.player.read",
        name: "player.read",
        reason: "读取当前播放与队列进度，判断什么时候该续歌"
      },
      {
        key: "roam.player.control",
        name: "player.control",
        reason: "读取队列结构并按需补歌"
      },
      {
        key: "roam.player.intercept",
        name: "player.intercept",
        reason: "在队列快播完时先补歌，做到无缝续播"
      }
    ]
  },
  ui: {
    pages: [
      {
        id: "roam-page",
        title: "私人漫游",
        mount: "sidebar",
        group: "tools",
        view: "roam",
        icon: { kind: "asset", resource: "icon.roam" },
        order: 20
      }
    ]
  }
};
exports.package = { formatVersion: 2, syntax: "js", signature: null };

/* ==== 10-util.js ==== */
/* ============ 运行时宿主与状态 ============ */
const R = {
  ctx: null,
  ready: false,
  cfg: {
    enabled: true,
    autoStart: true,
    batch: 4,
    keepAhead: 6,
    poolSize: 24,
    avoidRepeatHours: 12,
    instrumentalBias: 0.35,
    crossPlatform: true,
    autoYield: true,
    mode: "all",
    explore: 0,
    source: "",
    sources: {},
    genres: {
      "华语 流行": 30,
      "欧美 流行": 14,
      "日语 流行": 10,
      "韩语 流行": 8,
      "粤语": 10,
      "民谣": 10,
      "电子": 6,
      "纯音乐": 8,
      "说唱": 4,
      "摇滚": 6
    }
  },
  mem: {
    pool: [],
    played: [],
    artists: {},
    disliked: [],
    blockedArtists: [],
    page: "",
    sources: [],
    dailyDate: "",
    daily: [],
    mineIds: {},
    foreign: 0,
    lastTrackId: "",
    lastRefillAt: 0,
    lastAppendAt: 0,
    filling: false,
    appending: false,
    lastError: "",
    lastEvent: "",
    appendedCount: 0,
    startedAt: 0
  }
};

const PK = {
  musicRead: "roam.music.read",
  musicControl: "roam.music.control",
  playerRead: "roam.player.read",
  playerControl: "roam.player.control",
  intercept: "roam.player.intercept"
};

/* ============ 基础工具 ============ */
function nowMs() {
  return Date.now();
}

function num(v, fallback) {
  if (typeof v === "number" && isFinite(v)) return v;
  var n = Number(v);
  return isFinite(n) ? n : (fallback === undefined ? 0 : fallback);
}

function clamp(v, lo, hi) {
  var n = num(v, lo);
  if (n < lo) n = lo;
  if (n > hi) n = hi;
  return n;
}

function errMsg(e) {
  if (!e) return "未知错误";
  if (typeof e === "string") return e;
  if (e.message) return String(e.message);
  try {
    return JSON.stringify(e);
  } catch (x) {
    return String(e);
  }
}

function log(level, message, data) {
  var c = R.ctx;
  if (!c || !c.log) return;
  var fn = c.log[level] || c.log.info;
  try {
    if (data === undefined) fn.call(c.log, String(message));
    else fn.call(c.log, String(message), data);
  } catch (e) {
    /* 日志本身失败不影响主流程 */
  }
}

function note(event, data) {
  R.mem.lastEvent = event;
  log("debug", "roam " + event, data || {});
}

function toast(message, level) {
  var c = R.ctx;
  if (!c || !c.ui || !c.ui.toast) return;
  try {
    c.ui.toast({ message: String(message), level: level || "info" });
  } catch (e) {
    /* 忽略 */
  }
}

/* ServiceCall：把宿主给的 operation 透传下去 */
function svc(operation, permissionKey) {
  return { operation: operation, permissionKey: permissionKey || PK.musicRead };
}

function isDeadOp(e) {
  var m = errMsg(e);
  return m.indexOf("已取消") >= 0 || m.indexOf("expired") >= 0 || m.indexOf("Abort") >= 0 || m.indexOf("aborted") >= 0 || m.indexOf("deadline") >= 0;
}

/* ============ 歌曲实体工具 ============ */
function artistNames(entity) {
  var out = [];
  var list = entity && entity.metadata && entity.metadata.artists;
  if (Array.isArray(list)) {
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (!a) continue;
      var name = typeof a === "string" ? a : (a.name || a.title || "");
      if (name) out.push(String(name));
    }
  }
  if (!out.length && entity && entity.subtitle) out.push(String(entity.subtitle));
  return out;
}

function artistText(entity) {
  return artistNames(entity).join(" / ");
}

function primaryArtist(entity) {
  var list = artistNames(entity);
  return list.length ? list[0] : "";
}

function trackKey(entity) {
  var ref = entity && entity.ref;
  if (!ref) return "";
  return String(ref.providerId || "") + ":" + String(ref.id || "");
}

function normText(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/（[^）]*）/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/【[^】]*】/g, " ")
    .replace(/[\s\-_—·.,，。!！?？:：'"“”‘’/\\]+/g, "");
}

/* 跨平台去重键：同一首歌在不同平台的 id 不同，靠「歌名 + 主艺人」收敛 */
function songKey(entity) {
  var title = normText(entity && entity.title);
  var artist = normText(primaryArtist(entity));
  return (title || "?") + "|" + (artist || "?");
}

function isInstrumental(entity) {
  var t = String((entity && entity.title) || "") + " " + String((entity && entity.metadata && entity.metadata.album) || "");
  return /纯音乐|纯享|instrumental|钢琴曲|伴奏|bgm|轻音乐|治愈|白噪音|轻快|古典|交响|ost/i.test(t);
}

function hashStr(s) {
  var h = 2166136261;
  var str = String(s || "");
  for (var i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

function pickWeighted(map) {
  var keys = Object.keys(map || {});
  var total = 0;
  for (var i = 0; i < keys.length; i++) total += num(map[keys[i]], 0);
  if (total <= 0) return keys.length ? keys[0] : "";
  var roll = Math.random() * total;
  for (var j = 0; j < keys.length; j++) {
    roll -= num(map[keys[j]], 0);
    if (roll <= 0) return keys[j];
  }
  return keys[keys.length - 1];
}

function todayKey() {
  var d = new Date();
  var m = d.getMonth() + 1;
  var day = d.getDate();
  return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (day < 10 ? "0" + day : day);
}

/* 时长格式化（毫秒 → m:ss） */
function fmtDuration(ms) {
  var n = num(ms, 0);
  if (n <= 0) return "";
  var total = Math.round(n / 1000);
  var m = Math.floor(total / 60);
  var s = total % 60;
  return m + ":" + (s < 10 ? "0" + s : s);
}

/* ==== 20-store.js ==== */
/* ============ 持久化 ============ */
const STORE_CONFIG = "config";
const STORE_STATE = "state";

var saveTimer = null;

function sanitizeConfig(raw) {
  var out = {};
  var src = raw && typeof raw === "object" ? raw : {};
  out.enabled = typeof src.enabled === "boolean" ? src.enabled : R.cfg.enabled;
  out.autoStart = typeof src.autoStart === "boolean" ? src.autoStart : R.cfg.autoStart;
  out.batch = clamp(src.batch === undefined ? R.cfg.batch : src.batch, 1, 10);
  out.keepAhead = clamp(src.keepAhead === undefined ? R.cfg.keepAhead : src.keepAhead, 0, 30);
  out.poolSize = clamp(src.poolSize === undefined ? R.cfg.poolSize : src.poolSize, 6, 80);
  out.avoidRepeatHours = clamp(src.avoidRepeatHours === undefined ? R.cfg.avoidRepeatHours : src.avoidRepeatHours, 0, 168);
  out.instrumentalBias = clamp(src.instrumentalBias === undefined ? R.cfg.instrumentalBias : src.instrumentalBias, 0, 1);
  out.crossPlatform = typeof src.crossPlatform === "boolean" ? src.crossPlatform : R.cfg.crossPlatform;
  out.autoYield = src.autoYield === false ? false : true;
  /* 推荐模式：all = 全平台混合热歌，single = 只用指定平台的热歌 */
  out.mode = src.mode === "single" ? "single" : "all";
  out.source = typeof src.source === "string" ? src.source : "";
  /* 探索度：0 = 纯相似推荐，100 = 基本都是随机探索 */
  out.explore = clamp(num(src.explore, 0), 0, 100);

  var sources = {};
  if (src.sources && typeof src.sources === "object") {
    var sKeys = Object.keys(src.sources);
    for (var i = 0; i < sKeys.length; i++) {
      var w = num(src.sources[sKeys[i]], 0);
      if (w > 0) sources[sKeys[i]] = clamp(w, 1, 100);
    }
  }
  out.sources = sources;

  var genres = {};
  /* 注意：用户可能把权重全部清零（存成 {}），这时绝不能回落到默认权重，
     只有「配置里根本没有 genres 字段」才用默认值 */
  var hasGenres = !!src.genres && typeof src.genres === "object";
  var gSrc = hasGenres ? src.genres : R.cfg.genres;
  var gKeys = Object.keys(gSrc);
  for (var j = 0; j < gKeys.length; j++) {
    genres[gKeys[j]] = clamp(gSrc[gKeys[j]], 0, 100);
  }
  out.genres = hasGenres ? genres : R.cfg.genres;
  return out;
}

function sanitizeEntity(entity) {
  if (!entity || typeof entity !== "object") return null;
  var ref = entity.ref;
  if (!ref || ref.kind !== "track" || !ref.id || !ref.providerId) return null;
  return entity;
}

function sanitizeState(raw) {
  var src = raw && typeof raw === "object" ? raw : {};
  var mem = R.mem;
  mem.pool = [];
  mem.played = [];
  mem.artists = {};
  mem.daily = [];
  mem.dailyDate = typeof src.dailyDate === "string" ? src.dailyDate : "";

  if (Array.isArray(src.pool)) {
    for (var i = 0; i < src.pool.length && mem.pool.length < 80; i++) {
      var e1 = sanitizeEntity(src.pool[i]);
      if (e1) mem.pool.push(e1);
    }
  }
  if (Array.isArray(src.played)) {
    for (var j = 0; j < src.played.length && mem.played.length < 400; j++) {
      var p = src.played[j];
      if (p && p.key) mem.played.push({ key: String(p.key), at: num(p.at, 0) });
    }
  }
  if (src.artists && typeof src.artists === "object") {
    var ak = Object.keys(src.artists);
    for (var k = 0; k < ak.length && k < 300; k++) {
      mem.artists[ak[k]] = num(src.artists[ak[k]], 0);
    }
  }
  if (Array.isArray(src.daily)) {
    for (var m = 0; m < src.daily.length && mem.daily.length < 40; m++) {
      var e2 = sanitizeEntity(src.daily[m]);
      if (e2) mem.daily.push(e2);
    }
  }
  if (src.appendedCount !== undefined) mem.appendedCount = num(src.appendedCount, 0);

  mem.disliked = [];
  if (Array.isArray(src.disliked)) {
    for (var n = 0; n < src.disliked.length && mem.disliked.length < 500; n++) {
      var id = String(src.disliked[n] || "");
      if (id) mem.disliked.push(id);
    }
  }
  mem.blockedArtists = [];
  if (Array.isArray(src.blockedArtists)) {
    for (var b = 0; b < src.blockedArtists.length && mem.blockedArtists.length < 200; b++) {
      var item = src.blockedArtists[b];
      if (item && item.name) mem.blockedArtists.push({ name: String(item.name), at: num(item.at, 0) });
    }
  }
}

function pruneState() {
  var mem = R.mem;
  if (mem.pool.length > 80) mem.pool = mem.pool.slice(0, 80);
  var cutoff = nowMs() - 1000 * 60 * 60 * 24 * 7;
  if (mem.played.length > 400) {
    mem.played = mem.played.filter(function (p) { return p.at >= cutoff; }).slice(-400);
  }
  var keys = Object.keys(mem.artists);
  if (keys.length > 300) {
    keys.sort(function (a, b) { return num(mem.artists[a], 0) - num(mem.artists[b], 0); });
    for (var i = 0; i < keys.length - 300; i++) delete mem.artists[keys[i]];
  }
}

var LEGACY_KEY = "roam.state";

/* v2 的曲风显示名 → v3 的搜索方向，尽量把用户原来的权重带过来 */
var GENRE_ALIAS = {
  "流行": "华语 流行",
  "华语": "华语 流行",
  "华语流行": "华语 流行",
  "欧美": "欧美 流行",
  "英文": "欧美 流行",
  "日语": "日语 流行",
  "韩语": "韩语 流行",
  "粤语": "粤语",
  "民谣": "民谣",
  "电子": "电子",
  "说唱": "说唱",
  "摇滚": "摇滚",
  "轻音乐": "纯音乐",
  "纯音乐": "纯音乐",
  "古典": "纯音乐"
};

async function migrateLegacy() {
  var ctx = R.ctx;
  var legacy = null;
  try {
    legacy = await ctx.storage.get(LEGACY_KEY);
  } catch (e) {
    return;
  }
  if (!legacy || typeof legacy !== "object") return;
  var genres = {};
  var weights = legacy.weights && typeof legacy.weights === "object" ? legacy.weights : {};
  var hit = 0;
  var keys = Object.keys(weights);
  for (var i = 0; i < keys.length; i++) {
    var alias = GENRE_ALIAS[keys[i]];
    if (!alias) continue;
    genres[alias] = clamp(weights[keys[i]], 0, 100);
    hit++;
  }
  if (hit) R.cfg.genres = sanitizeConfig({ genres: genres }).genres;
  if (legacy.enabled === true) R.cfg.enabled = true;
  log("info", "已从 v2 漫游迁移设置", { genres: hit });
  await saveConfig();
}

async function loadStore() {
  var ctx = R.ctx;
  var rawCfg = null;
  var rawState = null;
  try {
    rawCfg = await ctx.storage.get(STORE_CONFIG);
  } catch (e) {
    log("warn", "读取漫游配置失败", { error: errMsg(e) });
  }
  try {
    rawState = await ctx.storage.get(STORE_STATE);
  } catch (e) {
    log("warn", "读取漫游状态失败", { error: errMsg(e) });
  }
  R.cfg = sanitizeConfig(rawCfg);
  sanitizeState(rawState);
  if (rawCfg === null || rawCfg === undefined) {
    await migrateLegacy();
  }
  R.ready = true;
  log("info", "漫游状态已载入", {
    pool: R.mem.pool.length,
    played: R.mem.played.length,
    enabled: R.cfg.enabled
  });
}

async function saveConfig() {
  try {
    await R.ctx.storage.set(STORE_CONFIG, R.cfg);
  } catch (e) {
    log("warn", "保存漫游配置失败", { error: errMsg(e) });
  }
}

function snapshotState() {
  pruneState();
  return {
    pool: R.mem.pool,
    played: R.mem.played,
    artists: R.mem.artists,
    daily: R.mem.daily,
    dailyDate: R.mem.dailyDate,
    appendedCount: R.mem.appendedCount,
    disliked: R.mem.disliked,
    blockedArtists: R.mem.blockedArtists
  };
}

async function saveStateNow() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  try {
    await R.ctx.storage.set(STORE_STATE, snapshotState());
  } catch (e) {
    log("warn", "保存漫游状态失败", { error: errMsg(e) });
  }
}

function saveStateSoon() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(function () {
    saveTimer = null;
    saveStateNow();
  }, 900);
}

/* ==== 25-perms.js ==== */
/* ============ 权限：按需申请 ============
 * v3 的权限分「组」，宿主只对组弹一次申请框：
 *   musicControl      = 播放任意音源的歌曲（music.control）
 *   playbackIntercept = 拦截播放操作（player.intercept）
 * 这两个是「announce」类权限，安装时不会自动授予，必须运行时申请。
 * 少了 music.control，把别的音源的 track ref 写进队列会被宿主拒绝：
 *   「插件只能操作自己声明的资源」
 */
const PERM_PLAN = [
  { key: "roam.music.control", group: "musicControl", title: "播放任意音源的歌曲" },
  { key: "roam.player.intercept", group: "playbackIntercept", title: "拦截播放操作" }
];

var permState = {};
var permWarned = {};

function permApi() {
  return R.ctx && R.ctx.permissions ? R.ctx.permissions : null;
}

async function queryPerm(key) {
  var api = permApi();
  if (!api || typeof api.query !== "function") return "unavailable";
  try {
    var res = await api.query({ key: key });
    var status = res && res.status ? String(res.status) : "unavailable";
    permState[key] = status;
    return status;
  } catch (e) {
    log("debug", "查询权限失败", { key: key, error: errMsg(e) });
    return "unavailable";
  }
}

/* 只在 status === 'prompt' 时才弹窗；denied 不重复打扰 */
async function ensurePermissions(options) {
  var plan = (options && options.keys) || PERM_PLAN;
  var api = permApi();
  if (!api) return permState;
  for (var i = 0; i < plan.length; i++) {
    var item = plan[i];
    var status = await queryPerm(item.key);
    if (status === "prompt" && typeof api.requestGroup === "function") {
      try {
        var res = await api.requestGroup({ group: item.group });
        status = (res && res.status) || (await queryPerm(item.key));
        permState[item.key] = status;
      } catch (e) {
        log("warn", "申请权限失败", { key: item.key, error: errMsg(e) });
      }
    }
    log("info", "漫游权限", { key: item.key, name: item.title, status: permState[item.key] || status });
  }
  return permState;
}

function permGranted(key) {
  return permState[key] === "granted";
}

/* 写队列前调用：没授权就现场申请一次，仍不行就提示并让调用方优雅退出 */
async function requireMusicControl() {
  if (permGranted(PK.musicControl)) return true;
  var status = await queryPerm(PK.musicControl);
  if (status === "granted") return true;
  // 权限系统不可用（工作台/旧宿主）时放行，让宿主 RPC 自己拦，错误由调用方兜住
  if (status === "unavailable") return true;
  if (status === "prompt") {
    await ensurePermissions({ keys: [{ key: PK.musicControl, group: "musicControl", title: "播放任意音源的歌曲" }] });
    if (permGranted(PK.musicControl)) return true;
  }
  if (!permWarned[PK.musicControl]) {
    permWarned[PK.musicControl] = true;
    R.mem.lastError = "缺少「播放任意音源的歌曲」权限，无法写入队列";
    toast("私人漫游需要「播放任意音源的歌曲」权限，去 设置 → 插件管理 → 权限 里打开", "warning");
    log("warn", "缺少 music.control 权限", { status: status });
  }
  return false;
}

/* ==== 30-sources.js ==== */
/* ============ 音乐源发现与查询 ============ */
function sourceKey(src) {
  return String(src && src.id ? src.id : "");
}

function sourceLabel(src) {
  var name = String((src && src.name) || (src && src.id) || "未知音源");
  return name;
}

function sourceProviderId(src) {
  return String((src && src.providerId) || (src && src.id) || "");
}

function searchableSources() {
  return R.mem.sources.filter(function (s) {
    if (!s || s.available === false) return false;
    return true;
  });
}

/* ============ 音源列表缓存（重启后不必重新扫描） ============ */
var SRC_CACHE_KEY = "srcCache";
var SRC_CACHE_MAX_AGE = 604800000;

async function loadSourceCache() {
  try {
    var saved = await R.ctx.storage.get(SRC_CACHE_KEY);
    if (!saved || !Array.isArray(saved.list)) return [];
    if (saved.at && nowMs() - Number(saved.at) > SRC_CACHE_MAX_AGE) return [];
    return saved.list.filter(function (s) {
      return s && s.id;
    }).map(function (s) {
      return {
        id: String(s.id),
        providerId: String(s.providerId || ""),
        pluginId: String(s.pluginId || ""),
        name: sourceLabel(s),
        runtime: s.runtime,
        qualities: Array.isArray(s.qualities) ? s.qualities : [],
        available: s.available !== false,
        cached: true
      };
    });
  } catch (e) {
    log("debug", "读取音源缓存失败", { error: errMsg(e) });
    return [];
  }
}

async function saveSourceCache(list) {
  try {
    await R.ctx.storage.set(SRC_CACHE_KEY, {
      at: nowMs(),
      list: list.map(function (s) {
        return {
          id: s.id, providerId: s.providerId, pluginId: s.pluginId,
          name: s.name, runtime: s.runtime, qualities: s.qualities, available: s.available
        };
      })
    });
  } catch (e) {
    log("debug", "写音源缓存失败", { error: errMsg(e) });
  }
}
async function refreshSources(operation, options) {
  var force = !!(options && options.force);
  /* 3 秒内已经扫过就直接复用：启动时 enabled 事件 + 两个视图挂载会连着触发 */
  if (!force && R.mem.srcAt && nowMs() - R.mem.srcAt < 3000) return R.mem.sources;
  /* 同时只允许一次扫描 */
  if (R.mem.srcLoading) return R.mem.srcLoading;
  var job = refreshSourcesInner(operation);
  R.mem.srcLoading = job;
  try {
    return await job;
  } finally {
    R.mem.srcLoading = null;
    R.mem.srcAt = nowMs();
  }
}

async function refreshSourcesInner(operation) {
  var c = R.ctx;
  var list = [];
  try {
    if (!c.music || typeof c.music.sources !== "function") {
      R.mem.lastError = "当前宿主没有提供 music 服务";
      return [];
    }
    var raw = await c.music.sources();
    if (Array.isArray(raw)) list = raw;
  } catch (e) {
    R.mem.lastError = "扫描音乐源失败：" + errMsg(e);
    log("warn", "扫描音乐源失败", { error: errMsg(e) });
    return R.mem.sources;
  }

  var selfId = c.plugin && c.plugin.id ? String(c.plugin.id) : "";
  var usable = [];
  var rawIds = [];
  for (var i = 0; i < list.length; i++) {
    var s = list[i];
    if (!s || !s.id) continue;
    rawIds.push(String(s.id) + "@" + String(s.pluginId || "-"));
    /* 排除自己：宿主返回的 pluginId 是安装体哈希 id，不是 manifest id，
       所以用「自己声明的 provider id」判断最可靠（roam 这个 id 只有本插件注册） */
    if (String(s.id) === "roam") continue;
    if (s.pluginId && selfId && String(s.pluginId) === selfId) continue;
    var protocols = Array.isArray(s.protocols) ? s.protocols : [];
    var canSearch = protocols.length === 0 || protocols.indexOf("music.search@1") >= 0;
    if (!canSearch) continue;
    usable.push({
      id: String(s.id),
      providerId: String(s.providerId || ""),
      pluginId: String(s.pluginId || ""),
      name: sourceLabel(s),
      runtime: s.runtime,
      qualities: Array.isArray(s.qualities) ? s.qualities : [],
      available: s.available !== false
    });
  }

  /* 合并缓存：本次没扫到、但以前见过的平台继续保留（宿主启动顺序导致 v2 插件晚注册） */
  var freshIds = {};
  for (var f = 0; f < usable.length; f++) freshIds[usable[f].id] = true;
  for (var c2 = 0; c2 < R.mem.sources.length; c2++) {
    var old = R.mem.sources[c2];
    if (!old || !old.id || freshIds[old.id]) continue;
    if (!old.cached) continue;
    usable.push(old);
  }
  R.mem.sources = usable;
  void saveSourceCache(usable);
  // 新发现的音源给一个默认权重，用户已有的权重保留
  var changed = false;
  for (var j = 0; j < usable.length; j++) {
    var key = usable[j].id;
    if (R.cfg.sources[key] === undefined) {
      R.cfg.sources[key] = 50;
      changed = true;
    }
  }
  if (changed) await saveConfig();
  var brief = [];
  for (var b = 0; b < list.length; b++) {
    var it = list[b] || {};
    brief.push(String(it.id) + "|" + String(it.pluginId) + "|" + String(it.runtime) + "|" + String(it.name) + "|" + String((it.protocols || []).join(",")) + "|" + String(it.available));
  }
  log("debug", "扫描音乐源", { raw: rawIds, usable: usable.length, self: selfId, brief: brief });
  note("sources", { count: usable.length });
  return usable;
}

function configSourceIds() {
  var out = [];
  var list = searchableSources();
  for (var i = 0; i < list.length; i++) {
    if (list[i].available === false) continue;
    out.push(list[i]);
  }
  return out;
}

/* 当前生效的音源：
   mode === "single" 时只用用户选定的那一个平台；否则用「权重 > 0」的全部平台
   （权重只保留为兼容旧配置，界面已改成「全平台 / 单平台」两种模式） */
function enabledSources() {
  var all = configSourceIds();
  if (String(R.cfg.mode || "all") === "single") {
    var want = String(R.cfg.source || "");
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === want) return [all[i]];
    }
    /* 选中的平台暂时不可用（比如未登录/被停用），退回全平台，避免直接没歌 */
    if (all.length) return all;
  }
  return all;
}

function modeLabel() {
  return String(R.cfg.mode || "all") === "single" ? "单平台" : "全平台混合";
}

function sourceWeights() {
  var map = {};
  var enabled = enabledSources();
  for (var i = 0; i < enabled.length; i++) {
    map[enabled[i].id] = num(R.cfg.sources[enabled[i].id], 1);
  }
  return map;
}

function sourceById(id) {
  var key = String(id || "");
  for (var i = 0; i < R.mem.sources.length; i++) {
    if (R.mem.sources[i].id === key) return R.mem.sources[i];
  }
  return null;
}

function pickSource() {
  var weights = sourceWeights();
  var key = pickWeighted(weights);
  if (!key) return null;
  return sourceById(key);
}

/* ---- 音源调用节流：并发改成串行 + 间隔，失败退避（避免把音源插件的 worker 打崩） ---- */
/* 注意：宿主的静态预检只允许顶层变量初始值是字面量 / 函数 / require()，
   所以这里不能写 5 * 60 * 1000 或 Promise.resolve()，一律给字面量、运行时再算 */
var SRC_GAP_MS = 180;
var SRC_BACKOFF_MS = 300000;
var srcChain = null;
var srcFails = {};

function srcBlocked(id) {
  var f = srcFails[id];
  return !!(f && f.until > nowMs());
}

function srcOK(id) {
  if (srcFails[id]) delete srcFails[id];
}

function srcFail(id, e) {
  if (!id) return;
  var f = srcFails[id] || { count: 0, until: 0 };
  f.count += 1;
  if (f.count >= 2) {
    f.count = 0;
    f.until = nowMs() + SRC_BACKOFF_MS;
    log("warn", "音源连续失败，暂时跳过 5 分钟", { source: id, error: errMsg(e) });
  }
  srcFails[id] = f;
}

function withSrcSlot(fn) {
  if (!srcChain) srcChain = Promise.resolve();
  var run = srcChain.then(async function () {
    try {
      return await fn();
    } finally {
      await new Promise(function (resolve) { setTimeout(resolve, SRC_GAP_MS); });
    }
  });
  srcChain = run.then(function () {}, function () {});
  return run;
}

async function sourceSearch(operation, sourceId, query, limit) {
  if (srcBlocked(sourceId)) return [];
  return withSrcSlot(function () { return sourceSearchInner(operation, sourceId, query, limit); });
}

async function sourceCharts(operation, sourceId) {
  if (srcBlocked(sourceId)) return [];
  return withSrcSlot(function () { return sourceChartsInner(operation, sourceId); });
}

async function chartTracks(operation, chart, limit) {
  return withSrcSlot(function () { return chartTracksInner(operation, chart, limit); });
}

async function sourceSearchInner(operation, sourceId, query, limit) {
  var c = R.ctx;
  if (!c.music || typeof c.music.search !== "function") return [];
  if (!query) return [];
  var request = {
    query: String(query).slice(0, 120),
    kinds: ["track"],
    filters: {},
    limit: clamp(limit || 10, 1, 50)
  };
  try {
    var page = await c.music.search(sourceId, request, svc(operation, PK.musicRead));
    var items = page && Array.isArray(page.items) ? page.items : [];
    var out = [];
    for (var i = 0; i < items.length; i++) {
      var e = sanitizeEntity(items[i]);
      if (e) {
        e.__src = sourceId;
        out.push(e);
      }
    }
    srcOK(sourceId);
    return out;
  } catch (e) {
    if (!isDeadOp(e)) log("debug", "搜索失败", { source: sourceId, query: query, error: errMsg(e) });
    srcFail(sourceId, e);
    return [];
  }
}

async function sourceChartsInner(operation, sourceId) {
  var c = R.ctx;
  if (!c.music || !c.music.charts || typeof c.music.charts.list !== "function") return [];
  try {
    var page = await c.music.charts.list(sourceId, svc(operation, PK.musicRead));
    var items = page && Array.isArray(page.items) ? page.items : [];
    srcOK(sourceId);
    return items;
  } catch (e) {
    log("debug", "读取排行榜失败", { source: sourceId, error: errMsg(e) });
    srcFail(sourceId, e);
    return [];
  }
}

async function chartTracksInner(operation, chart, limit) {
  var c = R.ctx;
  if (!chart || !chart.ref) return [];
  var srcId = chart.__src || "";
  try {
    var page = await c.music.charts.getTracks(chart.ref, undefined, svc(operation, PK.musicRead));
    var items = page && Array.isArray(page.items) ? page.items : [];
    var out = [];
    var max = clamp(limit || 20, 1, 100);
    for (var i = 0; i < items.length && out.length < max; i++) {
      var e = sanitizeEntity(items[i]);
      if (e) {
        if (srcId) e.__src = srcId;
        out.push(e);
      }
    }
    srcOK(srcId);
    return out;
  } catch (e) {
    log("debug", "读取榜单曲目失败", { error: errMsg(e) });
    srcFail(srcId, e);
    return [];
  }
}

/* ==== 40-candidates.js ==== */
/* ============ 候选生成 ============ */
const GENRE_QUERIES = {
  "华语": ["华语流行", "中文热歌", "华语新歌"],
  "欧美": ["欧美流行", "pop hits", "billboard"],
  "日语": ["日语流行", "j-pop", "日系热歌"],
  "韩语": ["韩语流行", "k-pop", "韩流热歌"],
  "粤语": ["粤语经典", "粤语流行", "港乐"],
  "流行": ["流行热歌", "热门流行", "pop"],
  "摇滚": ["摇滚", "rock", "乐队"],
  "民谣": ["民谣", "华语民谣", "folk"],
  "古风": ["古风", "国风", "古风歌曲"],
  "电子": ["电子", "电音", "edm"],
  "舞曲": ["舞曲", "dance", "remix"],
  "说唱": ["说唱", "rap", "嘻哈"],
  "爵士": ["爵士", "jazz", "jazz cafe"],
  "古典": ["古典音乐", "classical", "钢琴曲"],
  "金属": ["金属", "metal", "重金属"],
  "朋克": ["朋克", "punk", "punk rock"],
  "蓝调": ["蓝调", "blues", "蓝调口琴"],
  "雷鬼": ["雷鬼", "reggae", "ska"],
  "乡村": ["乡村音乐", "country", "country road"],
  "英伦": ["英伦摇滚", "britpop", "英伦"],
  "后摇": ["后摇", "post rock", "器乐摇滚"],
  "轻音乐": ["轻音乐", "纯音乐", "instrumental"],
  "New Age": ["new age", "新世纪音乐", "冥想音乐"],
  "ACG": ["ACG", "动漫歌曲", "二次元"],
  "影视原声": ["影视原声", "电影原声", "ost"],
  "综艺": ["综艺歌曲", "综艺", "舞台"],
  "游戏": ["游戏音乐", "game music", "游戏原声"],
  "网络歌曲": ["网络歌曲", "网络热歌", "抖音热歌"],
  "翻唱": ["翻唱", "cover", "女声翻唱"],
  "闽南语": ["闽南语歌曲", "台语经典", "闽南歌"],
  "DJ": ["DJ", "DJ版", "DJ舞曲"],
  "慢摇": ["慢摇", "慢摇舞曲", "慢摇串烧"],
  "R&B": ["R&B", "rnb", "节奏布鲁斯"],
  "灵魂乐": ["灵魂乐", "soul", "neo soul"],
  "情歌": ["情歌", "经典情歌", "伤感情歌"],
  "伤感": ["伤感歌曲", "伤感", "失恋歌曲"],
  "治愈": ["治愈系", "治愈歌曲", "温暖治愈"],
  "钢琴": ["钢琴曲", "piano", "钢琴纯音"],
  "吉他": ["吉他曲", "guitar", "指弹吉他"],
  "睡前": ["睡前音乐", "助眠", "晚安曲"],
  "专注": ["专注音乐", "学习音乐", "工作学习背景音"],
  "驾车": ["开车听的歌", "驾车音乐", "公路旅行"],
  "运动": ["跑步音乐", "健身音乐", "运动节奏"]
};

function genreQueries(label) {
  var list = GENRE_QUERIES[label];
  if (Array.isArray(list) && list.length) return list;
  return [String(label || "").replace(/\s+/g, "")];
}

function recentKeySet() {
  var set = {};
  var cutoff = nowMs() - num(R.cfg.avoidRepeatHours, 12) * 3600 * 1000;
  for (var i = 0; i < R.mem.played.length; i++) {
    var p = R.mem.played[i];
    if (p && p.at >= cutoff && p.key) set[String(p.key)] = true;
  }
  return set;
}

function artistBlocked(name) {
  var key = String(name || "").toLowerCase();
  if (!key) return false;
  var cutoff = nowMs() - 3600 * 1000;
  var at = num(R.mem.artists[key], 0);
  return at >= cutoff;
}

function markTaken(entity) {
  var key = trackKey(entity);
  if (key) {
    R.mem.played.push({ key: key, at: nowMs() });
  }
  var artist = String(primaryArtist(entity) || "").toLowerCase();
  if (artist) R.mem.artists[artist] = nowMs();
  pruneState();
  saveStateSoon();
}

function poolKeys() {
  var set = {};
  for (var i = 0; i < R.mem.pool.length; i++) {
    var k = trackKey(R.mem.pool[i]);
    if (k) set[k] = true;
  }
  return set;
}

/* 「不喜欢」拉黑的歌曲不再进入推荐 */
function isDisliked(entity) {
  var id = String(((entity && entity.ref) || {}).id || "");
  if (!id) return false;
  var list = R.mem.disliked || [];
  for (var i = 0; i < list.length; i++) {
    if (String(list[i]) === id) return true;
  }
  return false;
}

/* 过滤 + 打分：返回可用候选中已排除重复、近期播放、同艺人过密的条目 */
function filterCandidates(list, seed, takenKeys, takenSongs) {
  var seenKey = {};
  var seenSong = {};
  var out = [];
  var seedKey = seed ? trackKey(seed) : "";
  var seedSong = seed ? songKey(seed) : "";
  for (var i = 0; i < list.length; i++) {
    var e = list[i];
    var key = trackKey(e);
    if (!key || key === seedKey) continue;
    if (seenKey[key] || takenKeys[key]) continue;
    if (isDisliked(e)) continue;
    var sk = songKey(e);
    if (sk && (sk === seedSong || sk === "__")) continue;
    if (sk && (seenSong[sk] || takenSongs[sk])) continue;
    if (artistBlocked(primaryArtist(e))) continue;
    if (!Array.isArray(e.metadata && e.metadata.artists) || !e.metadata.artists.length) continue;
    seenKey[key] = true;
    if (sk) seenSong[sk] = true;
    out.push(e);
  }
  return out;
}

/* 从若干条查询里收集候选 */
async function collectByQueries(operation, queries, perQuery) {
  var out = [];
  for (var i = 0; i < queries.length; i++) {
    var q = queries[i];
    if (!q || !q.source) continue;
    var items = await sourceSearch(operation, q.source, q.query, perQuery || 10);
    for (var j = 0; j < items.length; j++) out.push(items[j]);
    if (operation && operation.signal && operation.signal.aborted) break;
  }
  return out;
}

/* 组一组「同艺人 / 同曲跨平台 / 曲风」的查询，按权重挑源 */
function planQueries(seed, budget) {
  var plan = [];
  var sources = enabledSources();
  if (!sources.length) return plan;
  var seedSrc = "";
  if (seed && seed.ref) seedSrc = String(seed.ref.providerId || "");

  var artist = seed ? primaryArtist(seed) : "";
  var title = seed ? String(seed.title || "") : "";

  function otherSource() {
    var pick = pickSource();
    if (pick) return pick;
    return sources[Math.floor(Math.random() * sources.length)];
  }

  var singleMode = String(R.cfg.mode || "all") === "single";

  if (artist) {
    var s1 = otherSource();
    plan.push({ kind: "artist", source: s1 ? s1.id : "", query: artist });
    if (budget > 2) {
      var s2 = otherSource();
      if (s2 && (!s1 || s2.id !== s1.id)) {
        plan.push({ kind: "artist", source: s2.id, query: artist });
      }
    }
  }

  if (title && artist && R.cfg.crossPlatform && !singleMode) {
    var s3 = otherSource();
    plan.push({ kind: "same-song", source: s3 ? s3.id : "", query: (title + " " + artist).slice(0, 80) });
  }

  var genreCount = budget > 3 ? 2 : 1;
  for (var g = 0; g < genreCount; g++) {
    var label = pickWeighted(R.cfg.genres);
    if (!label) break;
    var qs = genreQueries(label);
    var text = qs[Math.floor(Math.random() * qs.length)];
    var gs = otherSource();
    plan.push({ kind: "genre", label: label, source: gs ? gs.id : "", query: text });
  }

  if (budget > 4) {
    var cs = otherSource();
    if (cs) plan.push({ kind: "chart", source: cs.id, query: "" });
  }

  return plan.filter(function (p) { return !!p.source; });
}

/* 榜单候选：随机挑一个榜单取一页 */
async function collectFromChart(operation, sourceId) {
  var charts = await sourceCharts(operation, sourceId);
  if (!charts.length) return [];
  var chart = charts[Math.floor(Math.random() * charts.length)];
  chart.__src = sourceId;
  var tracks = await chartTracks(operation, chart, 30);
  return shuffle(tracks).slice(0, 20);
}

/* 随机探索用的检索词：单字、字母、年份、常见词，组合起来覆盖面很大 */
var EXPLORE_WORDS = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
  "爱", "夜", "风", "雨", "光", "梦", "海", "天", "花", "云", "月",
  "夏天", "冬天", "凌晨", "晚安", "旅行", "城市", "少年", "故乡",
  "lofi", "ambient", "piano", "guitar", "jazz", "soul", "funk",
  "2008", "2012", "2016", "2019", "2021", "2023", "2025"
];

async function exploreRaw(operation, count) {
  var out = [];
  var sources = enabledSources();
  if (!sources.length) return out;
  var rounds = clamp(Math.ceil(count / 2), 2, 8);
  for (var i = 0; i < rounds && out.length < count * 5; i++) {
    var w = EXPLORE_WORDS[Math.floor(Math.random() * EXPLORE_WORDS.length)];
    var src = sources[Math.floor(Math.random() * sources.length)];
    var items = await sourceSearch(operation, src.id, w, 10);
    for (var j = 0; j < items.length; j++) out.push(items[j]);
    if (operation && operation.signal && operation.signal.aborted) break;
  }
  /* 再随机挑一个平台的随机榜单，取几张冷门票 */
  var cs = sources[Math.floor(Math.random() * sources.length)];
  out = out.concat(await collectFromChart(operation, cs.id));
  return out;
}
async function buildCandidates(operation, need) {
  var mem = R.mem;
  var seed = mem.seed || null;
  var want = clamp(need || R.cfg.batch, 1, 20);
  var plan = planQueries(seed, 5);

  var raw = [];
  var queries = [];
  var chartSources = [];
  for (var i = 0; i < plan.length; i++) {
    if (plan[i].kind === "chart") chartSources.push(plan[i].source);
    else queries.push(plan[i]);
  }

  raw = raw.concat(await collectByQueries(operation, queries, 10));
  for (var cs = 0; cs < chartSources.length && raw.length < want * 6; cs++) {
    raw = raw.concat(await collectFromChart(operation, chartSources[cs]));
  }

  var takenKeys = poolKeys();
  var current = mem.current;
  if (current) takenKeys[trackKey(current)] = true;
  var recent = recentKeySet();
  for (var rk in recent) if (Object.prototype.hasOwnProperty.call(recent, rk)) takenKeys[rk] = true;

  var takenSongs = {};
  for (var p = 0; p < mem.pool.length; p++) takenSongs[songKey(mem.pool[p])] = true;

  var usable = filterCandidates(raw, seed, takenKeys, takenSongs);

  // 打分：同艺人加分，纯音乐按配置惩罚，榜单来源略加分
  var scored = [];
  for (var s = 0; s < usable.length; s++) {
    var e = usable[s];
    var score = 1;
    if (seed && primaryArtist(seed) && normText(primaryArtist(seed)) === normText(primaryArtist(e))) score += 2.5;
    if (isInstrumental(e)) {
      var bias = num(R.cfg.instrumentalBias, 0.35);
      score *= bias <= 0 ? 0.05 : bias + 0.35;
    }
    if (planKindFor(plan, e) === "chart") score += 0.4;
    score += Math.random() * 1.4;
    scored.push({ e: e, score: score });
  }
  scored.sort(function (a, b) { return b.score - a.score; });

  /* 探索度：want 里有 exploreWant 首来自随机探索（随机词检索 + 随机榜单） */
  var explorePct = clamp(num(R.cfg.explore, 0), 0, 100);
  var exploreWant = Math.round(want * explorePct / 100);
  if (exploreWant > want) exploreWant = want;
  var simWant = want - exploreWant;

  var picked = [];
  for (var q = 0; q < scored.length && picked.length < simWant; q++) picked.push(scored[q].e);

  if (exploreWant > 0) {
    var exRaw = await exploreRaw(operation, exploreWant);
    var exUsable = filterCandidates(exRaw, seed, takenKeys, takenSongs);
    var exScored = [];
    for (var x = 0; x < exUsable.length; x++) exScored.push({ e: exUsable[x], score: Math.random() });
    exScored.sort(function (a, b) { return b.score - a.score; });
    for (var y = 0; y < exScored.length && picked.length < want; y++) picked.push(exScored[y].e);
    note("explore", { want: exploreWant, got: picked.length - simWant });
  }

  return shuffle(picked);
}

function planKindFor(plan, entity) {
  var src = String(entity && entity.__src ? entity.__src : "");
  for (var i = 0; i < plan.length; i++) {
    if (plan[i].source === src && plan[i].kind === "chart") return "chart";
  }
  return "";
}

/* 今日 30 首：各源榜单 + 曲风搜索混合 */
async function buildDaily(operation) {
  var sources = enabledSources();
  if (!sources.length) {
    await refreshSources(operation);
    sources = enabledSources();
  }
  var out = [];
  var takenSongs = {};
  var takenKeys = {};

  function take(list, limit) {
    var added = 0;
    var cap = num(limit, 999);
    for (var i = 0; i < list.length && out.length < 30 && added < cap; i++) {
      var e = list[i];
      var k = trackKey(e);
      var sk = songKey(e);
      if (!k || takenKeys[k] || takenSongs[sk]) continue;
      takenKeys[k] = true;
      takenSongs[sk] = true;
      out.push(e);
      added++;
    }
    return added;
  }

  /* 每个平台都要有份：单源最多占 20/源数（至少 2 首），避免第一个源把 30 首全吃光 */
  var chartQuota = Math.max(2, Math.ceil(20 / sources.length));
  for (var i = 0; i < sources.length && out.length < 30; i++) {
    var tracks = await collectFromChart(operation, sources[i].id);
    take(tracks, chartQuota);
    if (operation && operation.signal && operation.signal.aborted) break;
  }
  var labels = Object.keys(R.cfg.genres).filter(function (k) { return num(R.cfg.genres[k], 0) > 0; });
  for (var j = 0; j < labels.length && out.length < 30; j++) {
    var label = labels[j];
    var qs = genreQueries(label);
    var src = sources[j % sources.length];
    var items = await sourceSearch(operation, src.id, qs[Math.floor(Math.random() * qs.length)], 12);
    take(items, Math.max(2, Math.ceil(10 / sources.length)));
  }

  /* 还差就用各源榜单补齐，仍然轮转，别只补一个平台 */
  for (var r = 0; out.length < 30 && r < sources.length * 2; r++) {
    var s2 = sources[r % sources.length];
    var more = await collectFromChart(operation, s2.id);
    if (!take(more, 30)) break;
  }
  return out;
}

/* ==== 50-runtime.js ==== */
/* ============ 队列 / 播放器 / 候选池 ============ */
function cleanEntity(entity) {
  var out = {};
  var keys = Object.keys(entity || {});
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] === "__src") continue;
    out[keys[i]] = entity[keys[i]];
  }
  return out;
}

function playable(entity) {
  return !!entity && entity.playable !== false;
}

async function readQueue(operation) {
  try {
    var state = await R.ctx.queue.get(svc(operation, PK.playerRead));
    if (state && Array.isArray(state.items)) {
      R.mem.queue = state;
      return state;
    }
  } catch (e) {
    log("debug", "读取队列失败", { error: errMsg(e) });
  }
  return R.mem.queue || null;
}

async function readPlayer(operation) {
  try {
    var state = await R.ctx.player.getState(svc(operation, PK.playerRead));
    if (state) {
      R.mem.player = state;
      if (state.track) R.mem.seed = cleanEntity(state.track);
      return state;
    }
  } catch (e) {
    log("debug", "读取播放状态失败", { error: errMsg(e) });
  }
  return R.mem.player || null;
}

function remainingAfterCurrent(queue, player) {
  if (!queue || !Array.isArray(queue.items)) {
    // 没有队列信息时按「只剩当前这首」处理，保证能续上
    return 0;
  }
  var idx = num(queue.currentIndex, 0);
  if (player && player.track) {
    var key = trackKey(player.track);
    for (var i = 0; i < queue.items.length; i++) {
      if (trackKey(queue.items[i]) === key) {
        idx = i;
        break;
      }
    }
  }
  return Math.max(0, queue.items.length - idx - 1);
}

async function fillPool(operation, force) {
  /* 已经有补货在跑：直接等它，别丢请求（串行闸门会让补货变慢） */
  if (R.mem.filling) {
    try {
      return await R.mem.fillJob;
    } catch (e) {
      return 0;
    }
  }
  if (!force && R.mem.pool.length >= num(R.cfg.poolSize, 24)) return 0;
  R.mem.filling = true;
  R.mem.fillJob = fillPoolInner(operation, force);
  try {
    return await R.mem.fillJob;
  } finally {
    R.mem.filling = false;
    R.mem.fillJob = null;
  }
}

async function fillPoolInner(operation, force) {
  try {
    if (!searchableSources().length) await refreshSources(operation);
    var need = Math.max(0, num(R.cfg.poolSize, 24) - R.mem.pool.length);
    if (need <= 0) return 0;
    if (need > 8) need = 8;
    var picked = await buildCandidates(operation, need);
    var existing = poolKeys();
    var added = 0;
    for (var i = 0; i < picked.length; i++) {
      var e = cleanEntity(picked[i]);
      var key = trackKey(e);
      if (!key || existing[key]) continue;
      if (!playable(e)) continue;
      existing[key] = true;
      R.mem.pool.push(e);
      added++;
    }
    R.mem.lastRefillAt = nowMs();
    if (added > 0) saveStateSoon();
    note("fill", { added: added, pool: R.mem.pool.length });
    return added;
  } catch (e) {
    R.mem.lastError = "生成候选失败：" + errMsg(e);
    log("warn", "生成候选失败", { error: errMsg(e) });
    return 0;
  }
}

function takeFromPool(n) {
  var want = clamp(n || R.cfg.batch, 1, 50);
  var out = [];
  while (out.length < want && R.mem.pool.length) {
    var e = R.mem.pool.shift();
    if (!e) continue;
    if (!playable(e)) continue;
    out.push(e);
  }
  return out;
}

async function appendToQueue(operation, items) {
  if (!items || !items.length) return 0;
  if (!(await requireMusicControl())) {
    // 没权限就别把候选池清空，歌留着下次再试
    return 0;
  }
  var clean = items.map(cleanEntity);
  try {
    await R.ctx.queue.append(clean, svc(operation, PK.playerControl));
    for (var i = 0; i < clean.length; i++) {
      markTaken(clean[i]);
      var rid = clean[i] && clean[i].ref ? String(clean[i].ref.id || "") : "";
      if (rid) {
        if (!R.mem.mineIds) R.mem.mineIds = {};
        R.mem.mineIds[rid] = 1;
        var keys = Object.keys(R.mem.mineIds);
        if (keys.length > 300) R.mem.mineIds = {};
      }
    }
    R.mem.appendedCount = num(R.mem.appendedCount, 0) + clean.length;
    R.mem.lastAppendAt = nowMs();
    saveStateSoon();
    note("append", { count: clean.length });
    return clean.length;
  } catch (e) {
    // 追加失败：把歌放回池子，下一轮再试
    R.mem.pool = clean.concat(R.mem.pool).slice(0, 60);
    R.mem.lastError = "写入队列失败：" + errMsg(e);
    log("warn", "写入队列失败", { error: errMsg(e) });
    return 0;
  }
}

/* 保证队列里还有 keepAhead 首待播 */
async function ensureAhead(operation, reason) {
  if (!R.cfg.enabled) return 0;
  var queue = R.mem.queue;
  var player = R.mem.player;
  var remain = remainingAfterCurrent(queue, player);
  var keep = num(R.cfg.keepAhead, 6);
  if (remain >= keep) {
    note("ahead-ok", { remain: remain, keep: keep, reason: reason });
    return 0;
  }

  var need = keep - remain;
  if (need > num(R.cfg.batch, 4) * 2) need = num(R.cfg.batch, 4) * 2;

  if (!R.mem.pool.length) {
    await fillPool(operation, false);
  }
  if (!R.mem.pool.length) {
    R.mem.lastError = "候选池空了，稍后会自动重试";
    log("warn", "补队列失败：候选池空", { reason: reason, remain: remain });
    return 0;
  }
  var items = takeFromPool(need);
  var appended = await appendToQueue(operation, items);
  if (appended > 0) {
    // 队列已变，刷新快照
    R.mem.queue = null;
    void readQueue(operation);
  }
  note("ahead", { reason: reason, remain: remain, appended: appended });
  return appended;
}

/* 队列真的播完了：补歌并继续播放 */
async function resumeFromPool(operation) {
  if (!R.cfg.enabled) return false;
  if (!R.mem.pool.length) await fillPool(operation, true);
  var items = takeFromPool(num(R.cfg.batch, 4));
  if (!items.length) return false;
  if (!(await requireMusicControl())) {
    R.mem.pool = items.concat(R.mem.pool).slice(0, 60);
    return false;
  }
  var clean = items.map(cleanEntity);
  try {
    await R.ctx.queue.append(clean, svc(operation, PK.playerControl));
    for (var i = 0; i < clean.length; i++) {
      markTaken(clean[i]);
      var rid = clean[i] && clean[i].ref ? String(clean[i].ref.id || "") : "";
      if (rid) {
        if (!R.mem.mineIds) R.mem.mineIds = {};
        R.mem.mineIds[rid] = 1;
        var keys = Object.keys(R.mem.mineIds);
        if (keys.length > 300) R.mem.mineIds = {};
      }
    }
    R.mem.appendedCount = num(R.mem.appendedCount, 0) + clean.length;
    await R.ctx.player.play(clean[0].ref, svc(operation, PK.playerControl));
    R.mem.lastAppendAt = nowMs();
    saveStateSoon();
    note("resume", { count: clean.length, title: clean[0].title });
    return true;
  } catch (e) {
    R.mem.pool = clean.concat(R.mem.pool).slice(0, 60);
    R.mem.lastError = "续播失败：" + errMsg(e);
    log("warn", "续播失败", { error: errMsg(e) });
    return false;
  }
}

async function skipAndContinue(operation) {
  var ok = await resumeFromPool(operation);
  if (!ok) {
    var appended = await ensureAhead(operation, "manual");
    if (appended > 0) {
      try {
        await R.ctx.player.next(svc(operation, PK.playerControl));
      } catch (e) {
        log("debug", "切歌失败", { error: errMsg(e) });
      }
    }
  }
  return ok;
}

/* ==== 60-actions.js ==== */
/* ============ 对外动作（名字与语义沿用 v2） ============ */
var WEIGHT_LABELS = [
  "华语", "欧美", "日语", "韩语", "粤语", "闽南语",
  "流行", "摇滚", "民谣", "古风", "电子", "舞曲", "说唱", "爵士", "古典",
  "金属", "朋克", "蓝调", "雷鬼", "乡村", "英伦", "后摇", "轻音乐", "New Age",
  "DJ", "慢摇", "R&B", "灵魂乐", "情歌", "伤感", "治愈", "钢琴", "吉他",
  "ACG", "影视原声", "综艺", "游戏", "网络歌曲", "翻唱", "睡前", "专注", "驾车", "运动"
];
var WEIGHT_GROUP_SIZES = [6, 27, 10];

function briefTrack(entity) {
  if (!entity) return null;
  return {
    key: trackKey(entity),
    title: String(entity.title || ""),
    artist: artistText(entity),
    src: String((entity.ref && entity.ref.providerId) || ""),
    dur: fmtDuration(num(entity.durationMs, 0)),
    inst: isInstrumental(entity)
  };
}

function buildSnapshot() {
  var sources = [];
  var singleMode = String(R.cfg.mode || "all") === "single";
  for (var i = 0; i < R.mem.sources.length; i++) {
    var s = R.mem.sources[i];
    if (!s) continue;
    sources.push({
      id: s.id,
      name: s.name,
      enabled: singleMode ? String(R.cfg.source || "") === String(s.id) : true,
      selected: singleMode && String(R.cfg.source || "") === String(s.id),
      available: s.available !== false
    });
  }
  var pool = [];
  for (var k = 0; k < R.mem.pool.length && k < 40; k++) {
    var b = briefTrack(R.mem.pool[k]);
    if (b) pool.push(b);
  }
  var daily = [];
  for (var m = 0; m < R.mem.daily.length && m < 30; m++) {
    var d = briefTrack(R.mem.daily[m]);
    if (d) daily.push(d);
  }
  var player = R.mem.player || {};
  var queue = R.mem.queue || {};
  return {
    enabled: !!R.cfg.enabled,
    page: String(R.mem.page || ""),
    playing: player.track ? briefTrack(player.track) : null,
    status: String(player.status || "idle"),
    remain: remainingAfterCurrent(queue, player),
    queueLength: Array.isArray(queue.items) ? queue.items.length : 0,
    pool: pool,
    poolCount: R.mem.pool.length,
    daily: daily,
    dailyDate: R.mem.dailyDate,
    sources: sources,
    mode: String(R.cfg.mode || "all"),
    source: String(R.cfg.source || ""),
    modeLabel: modeLabel(),
    explore: clamp(num(R.cfg.explore, 0), 0, 100),
    appendedCount: num(R.mem.appendedCount, 0),
    lastError: R.mem.lastError || ""
  };
}

function applyConfigPatch(patch) {
  if (!patch || typeof patch !== "object") return false;
  if (patch.genres && typeof patch.genres === "object") {
    var gk = Object.keys(patch.genres);
    for (var i = 0; i < gk.length; i++) R.cfg.genres[gk[i]] = clamp(patch.genres[gk[i]], 0, 100);
  }
  var nums = ["batch", "keepAhead", "poolSize", "avoidRepeatHours", "instrumentalBias"];
  for (var n = 0; n < nums.length; n++) {
    var key = nums[n];
    if (patch[key] !== undefined) R.cfg[key] = clamp(patch[key], 0, 200);
  }
  if (typeof patch.crossPlatform === "boolean") R.cfg.crossPlatform = patch.crossPlatform;
  if (patch.mode === "single" || patch.mode === "all") R.cfg.mode = patch.mode;
  if (typeof patch.source === "string") R.cfg.source = patch.source;
  if (typeof patch.enabled === "boolean") R.cfg.enabled = patch.enabled;
  R.cfg = sanitizeConfig(R.cfg);
  return true;
}

async function ensureDaily(operation) {
  var date = todayKey();
  if (R.mem.daily.length && R.mem.dailyDate === date) return R.mem.daily;
  var items = await buildDaily(operation);
  R.mem.daily = items.map(cleanEntity);
  R.mem.dailyDate = date;
  saveStateSoon();
  return R.mem.daily;
}

async function appendAndMaybePlay(operation, items, play) {
  if (!items || !items.length) return 0;
  var clean = items.map(cleanEntity);
  var added = await appendToQueue(operation, clean);
  if (play && clean.length) {
    try {
      await R.ctx.player.play(clean[0].ref, svc(operation, PK.playerControl));
    } catch (e) {
      log("warn", "播放推荐失败", { error: errMsg(e) });
    }
  }
  return added;
}

/* ============ 面板动作 ============ */
async function actionSnapshot(input, operation) {
  void input;
  await readPlayer(operation);
  await readQueue(operation);
  if (!R.mem.sources.length) await refreshSources(operation);
  return buildSnapshot();
}

async function actionConfigSave(input, operation) {
  void operation;
  applyConfigPatch(input || {});
  await saveConfig();
  note("config", { batch: R.cfg.batch, keepAhead: R.cfg.keepAhead, mode: R.cfg.mode });
  return buildSnapshot();
}

async function actionStart(input, operation) {
  void input;
  var perm = await requireMusicControl();
  if (!perm) {
    toast("私人漫游需要「播放任意音源的歌曲」权限，去 设置 → 插件管理 → 权限 里打开", "warning");
    throw new Error("缺少 music.control 权限");
  }
  R.cfg.enabled = true;
  R.mem.lastError = "";
  await saveConfig();
  await fillPool(operation, false);
  if (!R.mem.pool.length) await fillPool(operation, true);
  var queue = await readQueue(operation);
  var player = await readPlayer(operation);
  var remain = remainingAfterCurrent(queue, player);
  var items = takeFromPool(Math.max(num(R.cfg.batch, 4), num(R.cfg.keepAhead, 6) - remain));
  var added = await appendAndMaybePlay(operation, items, !queue || !queue.items || !queue.items.length);
  toast(R.cfg.enabled ? "私人漫游已开启，队列快放完时会自动续歌" : "", "success");
  note("start", { appended: added });
  return { enabled: true, appended: added };
}

async function actionStop(input, operation) {
  void input;
  void operation;
  R.cfg.enabled = false;
  await saveConfig();
  toast("私人漫游已停止", "info");
  note("stop", {});
  return { enabled: false };
}

async function actionRefresh(input, operation) {
  void input;
  await fillPool(operation, false);
  if (R.mem.pool.length < num(R.cfg.batch, 4)) await fillPool(operation, true);
  var items = takeFromPool(num(R.cfg.batch, 4));
  var added = await appendAndMaybePlay(operation, items, false);
  toast(added ? "已追加 " + added + " 首推荐" : "暂时没有新推荐，稍后再试", added ? "success" : "info");
  note("refresh", { appended: added });
  return buildSnapshot();
}

async function blacklist(entity) {
  if (!entity) return { id: "", artist: "" };
  var id = String((entity.ref && entity.ref.id) || "");
  var artist = primaryArtist(entity);
  if (id) R.mem.disliked.push(id);
  if (R.mem.disliked.length > 500) R.mem.disliked = R.mem.disliked.slice(-500);
  if (artist) {
    R.mem.artists[String(artist).toLowerCase()] = nowMs();
    R.mem.blockedArtists = (R.mem.blockedArtists || []).concat([{ name: artist, at: nowMs() }]).slice(-200);
  }
  R.mem.pool = R.mem.pool.filter(function (e) {
    return String((e.ref && e.ref.id) || "") !== id;
  });
  if (R.mem.daily.length) {
    R.mem.daily = R.mem.daily.filter(function (e) {
      return String((e.ref && e.ref.id) || "") !== id;
    });
  }
  saveStateSoon();
  return { id: id, artist: artist };
}

async function actionDislike(input, operation) {
  void input;
  var player = await readPlayer(operation);
  var entity = (player && player.track) || R.mem.pool[0] || null;
  if (!entity) throw new Error("没有可标记的歌曲");
  var r = await blacklist(entity);
  try {
    await R.ctx.player.next(svc(operation, PK.playerControl));
  } catch (e) {
    log("info", "切歌失败（可能已是最后一首）", { error: errMsg(e) });
  }
  if (R.cfg.enabled) void ensureAhead(operation, "dislike");
  toast(r.artist ? "已减少「" + r.artist + "」这类推荐" : "已减少这类推荐", "success");
  note("dislike", r);
  return buildSnapshot();
}

async function actionDislikeItem(input, operation) {
  void operation;
  var ref = input && input.ref;
  var entity = findEntityByRef(ref);
  if (!entity && ref) {
    entity = {
      ref: ref,
      title: String(input.title || ""),
      metadata: { artists: [String(input.artist || "未知艺人")] }
    };
  }
  if (!entity) throw new Error("缺少歌曲信息");
  var r = await blacklist(entity);
  toast("已减少「" + String(entity.title || "这首") + "」这类推荐", "success");
  note("dislikeItem", r);
  return buildSnapshot();
}

async function actionPlay(input, operation) {
  var ref = input && input.ref;
  if (!ref) throw new Error("缺少歌曲信息");
  var entity = findEntityByRef(ref);
  if (!entity) throw new Error("这首不在推荐列表里");
  var queue = await readQueue(operation);
  var exists = false;
  if (queue && Array.isArray(queue.items)) {
    for (var i = 0; i < queue.items.length; i++) {
      if (trackKey(queue.items[i]) === trackKey(entity)) {
        exists = true;
        break;
      }
    }
  }
  if (!exists) await appendAndMaybePlay(operation, [entity], false);
  try {
    await R.ctx.player.play(entity.ref, svc(operation, PK.playerControl));
  } catch (e) {
    log("warn", "播放失败", { error: errMsg(e) });
    toast("播放失败：" + errMsg(e), "warning");
  }
  return { playing: trackKey(entity) };
}

async function actionDaily(input, operation) {
  void input;
  void operation;
  R.mem.page = "daily";
  return { page: "daily" };
}

async function actionRefreshDaily(input, operation) {
  void input;
  R.mem.page = "daily";
  R.mem.daily = [];
  var items = await ensureDaily(operation);
  toast("已重新生成今日 " + items.length + " 首", "success");
  return buildSnapshot();
}

async function actionPlayDaily(input, operation) {
  void input;
  var items = await ensureDaily(operation);
  if (!items.length) throw new Error("今天的推荐还没生成出来，稍后再试");
  await appendAndMaybePlay(operation, items.slice(0, 30), true);
  toast("已把今日 " + items.length + " 首加进队列", "success");
  note("daily.play", { count: items.length });
  return buildSnapshot();
}

async function actionBack(input, operation) {
  void input;
  void operation;
  R.mem.page = "";
  return { back: true };
}

async function actionReset(input, operation) {
  void input;
  void operation;
  R.mem.page = "";
  return { reset: true };
}

async function actionOpenPanel(input, operation) {
  void input;
  void operation;
  R.mem.page = "";
  var ids = ["help", "weights"];
  for (var i = 0; i < ids.length; i++) {
    try {
      await R.ctx.ui.pages.close(ids[i]);
    } catch (e) {
      /* 没开着就算了 */
    }
  }
  /* 原生页面不是 overlay，ui.pages.open 会被宿主拒绝；关掉抽屉就是「回到漫游面板」 */
  return { opened: "roam" };
}

async function actionHelp(input, operation) {
  void input;
  void operation;
  try {
    await R.ctx.ui.pages.open("help", {});
  } catch (e) {
    log("warn", "打开使用说明失败", { error: errMsg(e) });
    toast("打开使用说明失败：" + errMsg(e), "warning");
  }
  return { opened: "help" };
}

async function actionOpenWeights(input, operation) {
  void input;
  void operation;
  try {
    await R.ctx.ui.pages.open("weights", {});
  } catch (e) {
    log("warn", "打开曲风权重失败", { error: errMsg(e) });
    toast("打开曲风权重失败：" + errMsg(e), "warning");
  }
  return { opened: "weights" };
}

/* ============ 曲风权重 ============ */
function weightsSummary() {
  var active = [];
  for (var i = 0; i < WEIGHT_LABELS.length; i++) {
    var label = WEIGHT_LABELS[i];
    var w = num(R.cfg.genres[label], 0);
    if (w > 0) active.push(label + " " + w);
  }
  if (!active.length) return "全部为 0（纯相似推荐）";
  return active.join(" · ");
}

function weightsState() {
  var values = [];
  for (var i = 0; i < WEIGHT_LABELS.length; i++) values.push(num(R.cfg.genres[WEIGHT_LABELS[i]], 0));
  var sources = [];
  for (var s = 0; s < R.mem.sources.length; s++) {
    var src = R.mem.sources[s];
    if (!src) continue;
    var sid = String(src.id || "");
    sources.push({
      id: sid,
      name: String(src.name || src.id || ""),
      selected: String(R.cfg.source || "") === sid,
      available: src.available !== false
    });
  }
  return {
    values: values,
    labels: WEIGHT_LABELS.slice(),
    groupSizes: WEIGHT_GROUP_SIZES.slice(),
    autoYield: R.cfg.autoYield !== false,
    summary: weightsSummary(),
    mode: String(R.cfg.mode || "all") === "single" ? "single" : "all",
    platformId: String(R.cfg.source || ""),
    modeLabel: modeLabel(),
    explore: clamp(num(R.cfg.explore, 0), 0, 100),
    sources: sources
  };
}

async function actionWeightsLoad(input, operation) {
  void input;
  void operation;
  return weightsState();
}

async function actionWeightsSave(input, operation) {
  if (!input || input.source !== "roam-weights") throw new Error("保存来源无效");
  if (input.mode === "single" || input.mode === "all") R.cfg.mode = input.mode;
  if (typeof input.platformId === "string") R.cfg.source = input.platformId;
  if (typeof input.autoYield === "boolean") R.cfg.autoYield = input.autoYield;
  if (typeof input.explore === "number") R.cfg.explore = clamp(Math.round(input.explore), 0, 100);
  var values = Array.isArray(input.values) ? input.values : [];
  var next = {};
  for (var i = 0; i < WEIGHT_LABELS.length; i++) {
    var n = clamp(values[i], 0, 100);
    n = Math.round(n);
    if (n > 0) next[WEIGHT_LABELS[i]] = n;
  }
  R.cfg.genres = next;
  R.mem.pool = [];
  await saveConfig();
  if (R.cfg.enabled) void fillPool(operation, true);
  toast("曲风权重已保存：" + weightsSummary(), "success");
  note("weights.save", { summary: weightsSummary() });
  return weightsState();
}

async function actionWeightsReset(input, operation) {
  void input;
  void operation;
  R.cfg.genres = {};
  R.mem.pool = [];
  await saveConfig();
  toast("已清空曲风权重", "info");
  return weightsState();
}

async function actionSourcesRefresh(input, operation) {
  void input;
  await refreshSources(operation, { force: true });
  await saveConfig();
  toast("已重新扫描音乐源：" + R.mem.sources.length + " 个", "info");
  return buildSnapshot();
}

/* ==== 65-native.js ==== */
/* ============ 原生页面（版式与返回逻辑沿用 v2） ============ */
function sourceName(id) {
  var s = sourceById(id);
  return s && s.name ? String(s.name) : "";
}

function nativeItem(entity) {
  var e = cleanEntity(entity);
  var artists = artistNames(e);
  if (!artists.length) artists = ["未知艺人"];
  var md = e.metadata || {};
  var caps = Array.isArray(e.capabilities) && e.capabilities.length ? e.capabilities.slice(0, 8) : ["play"];
  var item = {
    ref: e.ref,
    title: String(e.title || "未知曲目"),
    capabilities: caps,
    metadata: { artists: artists }
  };
  var art = md.artworkUrl || md.artwork;
  if (art) item.metadata.artworkUrl = String(art);
  var album = md.album;
  if (album && typeof album === "object") album = album.name || album.title || "";
  if (!album && e.extensions && typeof e.extensions === "object") album = e.extensions.album || "";
  if (album) item.metadata.album = String(album);
  var dur = num(e.durationMs, num(md.durationMs, 0));
  if (dur > 0) {
    item.durationMs = dur;
    item.metadata.durationMs = dur;
  }
/* 第二行显示「艺人 · 专辑」：v3 原生列表不渲染专辑列，只能并进第二行 */
  var line2 = artists.join(" / ");
  if (item.metadata.album) line2 = line2 + " · " + item.metadata.album;
  item.subtitle = line2;
  if (e.playable === false) item.playable = false;
  return item;
}

function findEntityByRef(ref) {
  if (!ref) return null;
  var key = String((ref.providerId || "") + ":" + String(ref.id || ""));
  var lists = [R.mem.pool, R.mem.daily];
  if (R.mem.queue && Array.isArray(R.mem.queue.items)) lists.push(R.mem.queue.items);
  for (var i = 0; i < lists.length; i++) {
    var list = lists[i] || [];
    for (var j = 0; j < list.length; j++) {
      if (trackKey(list[j]) === key) return list[j];
    }
  }
  return null;
}

function pageStatusText(queueLength) {
  var parts = [];
  parts.push(R.cfg.enabled ? "漫游中" : "未开启");
  if (typeof queueLength === "number" && queueLength > 0) parts.push("队列 " + queueLength + " 首");
  if (R.mem.seed && R.mem.seed.title) parts.push("种子 " + String(R.mem.seed.title));
  if (R.mem.appendedCount) parts.push("本次已续 " + R.mem.appendedCount + " 首");
  if (R.mem.lastError) parts.push("最近错误：" + R.mem.lastError);
  return parts.join(" · ");
}

function genreSummaryText() {
  var keys = Object.keys(R.cfg.genres || {});
  var active = [];
  for (var i = 0; i < keys.length; i++) {
    var w = num(R.cfg.genres[keys[i]], 0);
    if (w > 0) active.push({ name: keys[i], weight: w });
  }
  active.sort(function (a, b) {
    return b.weight - a.weight;
  });
  if (!active.length) return " · 曲风：未设置（纯相似推荐）";
  var head = active.slice(0, 5).map(function (it) {
    return it.name + " " + it.weight;
  }).join(" / ");
  if (active.length > 5) head += " 等 " + active.length + " 种";
  return " · 曲风：" + head + " · 推荐范围：" + modeLabel();
}

function emptySection() {
  return {
    id: "empty",
    title: "还没有推荐",
    layout: "list",
    items: [
      {
        ref: { providerId: String(R.id), kind: "track", id: "0", scope: "provider" },
        title: "点下面的「开始漫游」",
        subtitle: "会基于当前播放的歌曲自动续歌",
        capabilities: ["play"],
        metadata: { artists: ["私人漫游"] }
      }
    ]
  };
}

async function buildPanelPage(operation) {
  if (R.mem.page === "daily") {
    try {
      var items = await ensureDaily(operation);
      return dailyPage(items);
    } catch (e) {
      log("warn", "渲染每日推荐失败", { error: errMsg(e) });
      R.mem.page = "";
    }
  }

  var sections = [];
  var queueItems = [];
  var currentIndex = -1;
  try {
    var q = await readQueue(operation);
    queueItems = (q && Array.isArray(q.items) ? q.items : []).filter(function (it) {
      return it && it.ref;
    });
    currentIndex = q && typeof q.currentIndex === "number" ? q.currentIndex : -1;
  } catch (e) {
    log("debug", "面板读取队列失败", { error: errMsg(e) });
  }

  if (queueItems.length) {
    sections.push({
      id: "queue",
      title: "播放队列（共 " + queueItems.length + " 首" +
        (currentIndex >= 0 ? "，当前第 " + (currentIndex + 1) + " 首" : "") + "）",
      layout: "list",
      items: queueItems.slice(0, 200).map(function (it) {
        /* 队列实体来自宿主，常常没有专辑/封面；用本地缓存里的同一首补上 */
        var known = findEntityByRef(it.ref);
        return nativeItem(known || it);
      }),
      onPlay: "roam.play"
    });
  }

  var inQueue = {};
  for (var i = 0; i < queueItems.length; i++) inQueue[trackKey(queueItems[i])] = true;
  var pending = [];
  for (var j = 0; j < R.mem.pool.length; j++) {
    var e = R.mem.pool[j];
    if (!e) continue;
    if (inQueue[trackKey(e)]) continue;
    pending.push(e);
  }
  if (pending.length) {
    sections.push({
      id: "batch",
      title: "还没进队列的推荐（点播放会追加进去）",
      layout: "list",
      items: pending.slice(0, 20).map(nativeItem),
      onPlay: "roam.play",
      itemActions: [{ label: "不喜欢", action: "roam.dislikeItem" }]
    });
  }

  if (!sections.length) sections.push(emptySection());

  return {
    type: "page",
    title: "私人漫游",
    description: pageStatusText(queueItems.length) + genreSummaryText(),
    actions: [
      {
        label: R.cfg.enabled ? "停止漫游" : "开始漫游",
        action: R.cfg.enabled ? "roam.stop" : "roam.start",
        primary: true
      },
      { label: "换一批", action: "roam.refresh" },
      { label: "不喜欢当前这首", action: "roam.dislike" },
      { label: "每日推荐", action: "roam.daily" },
      { label: "公告", action: "roam.help" },
      { label: "曲风权重设置", action: "roam.openWeights" }
    ],
    sections: sections
  };
}

function dailyPage(items) {
  return {
    type: "page",
    title: "每日推荐",
    description: R.mem.dailyDate + " · 共 " + items.length + " 首 · 每天自动换一批（最近听过的不再出现）",
    actions: [
      { label: "播放全部", action: "roam.playDaily", primary: true },
      { label: "重新生成", action: "roam.refreshDaily" },
      { label: "返回漫游面板", action: "roam.back" }
    ],
    sections: [
      {
        id: "daily",
        title: "今日 " + items.length + " 首",
        layout: "list",
        items: items.map(nativeItem),
        onPlay: "roam.play",
        itemActions: [{ label: "不喜欢", action: "roam.dislikeItem" }]
      }
    ]
  };
}

async function actionView(input, operation) {
  void input;
  try {
    return await buildPanelPage(operation);
  } catch (e) {
    log("warn", "渲染漫游面板失败", { error: errMsg(e) });
    return {
      type: "page",
      title: "私人漫游",
      description: "面板渲染失败：" + errMsg(e),
      actions: [{ label: "重新加载", action: "roam.view", primary: true }],
      sections: [emptySection()]
    };
  }
}

async function actionDailyView(input, operation) {
  void input;
  var items = await ensureDaily(operation);
  return dailyPage(items);
}

/* ==== 70-view-settings.js ==== */
/* ============ 曲风权重抽屉（版式沿用 v2，外加推荐范围开关） ============ */
function ViewWeights(ui) {
  var GROUP_TITLES = ["语种", "风格", "主题", "探索"];

  var style = document.createElement("style");
  style.textContent = [
    ":root { color-scheme: light dark; }",
    "body { margin: 0; }",
    ".head { position: sticky; top: 0; z-index: 3; display: flex; align-items: center; gap: 12px; padding: 12px 20px; backdrop-filter: blur(8px); background: rgba(127,127,127,.08); border-bottom: 1px solid rgba(127,127,127,.18); }",
    ".back { font: inherit; font-size: 13px; padding: 6px 12px; border-radius: 8px; cursor: pointer; border: 1px solid rgba(127,127,127,.35); background: transparent; color: inherit; }",
    ".back:hover { background: rgba(127,127,127,.16); }",
    ".title { font-size: 14px; font-weight: 600; }",
    ".body { padding: 8px 20px 20px; font: 13px/1.6 system-ui, 'Microsoft YaHei', sans-serif; }",
    "h3 { font-size: 12px; font-weight: 600; opacity: .6; margin: 18px 0 8px; letter-spacing: .04em; }",
    ".row { display: flex; align-items: center; gap: 8px; padding: 5px 0; }",
    ".name { flex: 0 0 84px; }",
    ".row.yield .name { flex: 1; }",
    ".chk { width: 20px; height: 20px; accent-color: #22c55e; cursor: pointer; }",
    ".bar { flex: 1; height: 4px; border-radius: 2px; background: rgba(127,127,127,.25); overflow: hidden; }",
    ".fill { height: 100%; width: 0%; background: #22c55e; transition: width .12s linear; }",
    ".step { width: 26px; height: 26px; line-height: 1; border-radius: 7px; cursor: pointer; border: 1px solid rgba(127,127,127,.3); background: transparent; color: inherit; font-size: 15px; }",
    ".step:hover { background: rgba(127,127,127,.16); }",
    ".num { width: 46px; text-align: center; font: inherit; padding: 4px 0; border-radius: 7px; border: 1px solid rgba(127,127,127,.3); background: transparent; color: inherit; }",
    ".foot { position: sticky; bottom: 0; display: flex; align-items: center; gap: 10px; padding: 12px 20px; backdrop-filter: blur(8px); background: rgba(127,127,127,.08); border-top: 1px solid rgba(127,127,127,.18); }",
    ".primary { font: inherit; font-size: 13px; padding: 8px 18px; border-radius: 8px; border: 0; cursor: pointer; color: #fff; background: #22c55e; }",
    ".ghost { font: inherit; font-size: 13px; padding: 8px 14px; border-radius: 8px; cursor: pointer; border: 1px solid rgba(127,127,127,.35); background: transparent; color: inherit; }",
    ".msg { font-size: 12px; opacity: .7; margin-left: auto; }",
    ".tip { padding: 8px 10px; border-radius: 8px; background: rgba(64,158,255,.10); font-size: 12px; margin: 0 0 6px; }",
    ".modes { display: flex; gap: 8px; flex-wrap: wrap; }",
    ".mode { font: inherit; font-size: 13px; padding: 7px 14px; border-radius: 8px; cursor: pointer; border: 1px solid rgba(127,127,127,.35); background: transparent; color: inherit; }",
    ".mode.on { border-color: #22c55e; color: #16a34a; background: rgba(34,197,94,.12); }",
    ".hint { font-size: 12px; opacity: .7; margin: 6px 0 0; }",
    ".plats { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }",
    ".plat { font: inherit; font-size: 12px; padding: 6px 12px; border-radius: 999px; cursor: pointer; border: 1px solid rgba(127,127,127,.35); background: transparent; color: inherit; }",
    ".plat.on { border-color: #22c55e; color: #16a34a; background: rgba(34,197,94,.12); }",
    ".plat[disabled] { opacity: .45; cursor: default; }"
  ].join("\n");

  var head = document.createElement("div");
  head.className = "head";
  var back = document.createElement("button");
  back.className = "back";
  back.textContent = "← 返回";
  var title = document.createElement("div");
  title.className = "title";
  title.textContent = "曲风权重";
  back.addEventListener("click", function () {
    Promise.resolve()
      .then(function () {
        return ui.invoke("roam.openPanel", {});
      })
      .catch(function () {})
      .then(function () {
        try {
          if (typeof ui.close === "function") ui.close();
        } catch (e) {}
      });
  });
  head.appendChild(back);
  head.appendChild(title);

  var body = document.createElement("div");
  body.className = "body";

  /* ---------- 推荐范围（全平台 / 单一平台） ---------- */
  var modeTitle = document.createElement("h3");
  modeTitle.textContent = "推荐范围";
  body.appendChild(modeTitle);

  var modeRow = document.createElement("div");
  modeRow.className = "modes";
  var modeAll = document.createElement("button");
  modeAll.className = "mode on";
  modeAll.textContent = "全平台混合";
  var modeOne = document.createElement("button");
  modeOne.className = "mode";
  modeOne.textContent = "单一平台";
  modeRow.appendChild(modeAll);
  modeRow.appendChild(modeOne);
  body.appendChild(modeRow);

  var modeHint = document.createElement("div");
  modeHint.className = "hint";
  modeHint.textContent = "全平台：已启用的所有音源一起出候选；单一平台：只用下面选中的那个平台。";
  body.appendChild(modeHint);

  var platBox = document.createElement("div");
  platBox.className = "plats";
  body.appendChild(platBox);

  var rescan = document.createElement("button");
  rescan.className = "ghost";
  rescan.style.marginTop = "8px";
  rescan.textContent = "重新扫描音源";
  body.appendChild(rescan);

  var curMode = "all";
  var curPlatform = "";
  var platButtons = [];

  function renderPlats() {
    platBox.replaceChildren();
    platButtons = [];
    for (var i = 0; i < platButtons.length; i++) {
      /* noop */
    }
    for (var k = 0; k < plats.length; k++) {
      (function (p, idx) {
        var btn = document.createElement("button");
        btn.className = "plat" + (p.selected ? " on" : "");
        btn.textContent = p.name + (p.available === false ? "（不可用）" : "");
        if (p.available === false) btn.disabled = true;
        btn.addEventListener("click", function () {
          curMode = "single";
          curPlatform = p.id;
          syncMode();
        });
        platBox.appendChild(btn);
        platButtons[idx] = { id: p.id, el: btn };
      })(plats[k], k);
    }
    syncMode();
  }

  function syncMode() {
    modeAll.className = "mode" + (curMode === "all" ? " on" : "");
    modeOne.className = "mode" + (curMode === "single" ? " on" : "");
    modeHint.textContent =
      curMode === "single"
        ? "只用下面选中的这个平台的热歌与搜索来补歌；它不可用时会自动退回全平台。"
        : "全平台：已启用的所有音源一起出候选，谁的歌合适就推谁。";
    for (var i = 0; i < platButtons.length; i++) {
      var b = platButtons[i];
      b.el.className = "plat" + (curMode === "single" && curPlatform === b.id ? " on" : "");
    }
    platBox.style.opacity = curMode === "single" ? "1" : ".6";
  }

  var plats = [];

  modeAll.addEventListener("click", function () {
    curMode = "all";
    syncMode();
  });
  modeOne.addEventListener("click", function () {
    curMode = "single";
    if (!curPlatform) {
      for (var i = 0; i < plats.length; i++) {
        if (plats[i].available !== false) {
          curPlatform = plats[i].id;
          break;
        }
      }
    }
    syncMode();
  });

  /* ---------- 曲风权重 ---------- */
  var tip = document.createElement("div");
  tip.className = "tip";
  tip.textContent = "数值是相对比例，不是百分比；全 0 = 纯相似推荐。";
  body.appendChild(tip);

  var inputs = [];
  var autoYieldBox = null;
  function rowOf(label, index) {
    var row = document.createElement("div");
    row.className = "row";
    var name = document.createElement("div");
    name.className = "name";
    name.textContent = label;

    var minus = document.createElement("button");
    minus.className = "step";
    minus.textContent = "−";
    var input = document.createElement("input");
    input.className = "num";
    input.type = "number";
    input.min = "0";
    input.max = "100";
    input.step = "5";
    input.value = "0";
    var plus = document.createElement("button");
    plus.className = "step";
    plus.textContent = "+";

    var bar = document.createElement("div");
    bar.className = "bar";
    var fill = document.createElement("div");
    fill.className = "fill";
    bar.appendChild(fill);

    function set(v) {
      var n = Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
      input.value = String(n);
      fill.style.width = n + "%";
      return n;
    }
    input.addEventListener("input", function () {
      set(input.value);
    });
    minus.addEventListener("click", function () {
      set(Number(input.value) - 5);
    });
    plus.addEventListener("click", function () {
      set(Number(input.value) + 5);
    });

    inputs[index] = {
      get: function () {
        return set(input.value);
      },
      set: set
    };

    row.appendChild(name);
    row.appendChild(minus);
    row.appendChild(input);
    row.appendChild(plus);
    row.appendChild(bar);
    return row;
  }

  var labels = [];
  var groupSizes = [];
  var rowsBuilt = false;

  function buildRows() {
    if (rowsBuilt) return;
    rowsBuilt = true;
    var index = -1;
    for (var g = 0; g < groupSizes.length; g++) {
      var h = document.createElement("h3");
      h.textContent = GROUP_TITLES[g] || "其他";
      body.appendChild(h);
      for (var i = 0; i < groupSizes[g]; i++) {
        index++;
        body.appendChild(rowOf(labels[index] || "—", index));
      }
    }
    /* 探索度跟曲风权重用同一种滑条 */
    var hx = document.createElement("h3");
    hx.textContent = "探索";
    body.appendChild(hx);
    body.appendChild(rowOf("探索度", labels.length));
    var hintX = document.createElement("div");
    hintX.className = "hint";
    hintX.textContent = "0 = 只用相似推荐；往右拉会混入随机词检索与随机榜单的歌，能听到更杂、更小众的东西。";
    body.appendChild(hintX);

    /* 自动让位开关 */
    var hy = document.createElement("h3");
    hy.textContent = "行为";
    body.appendChild(hy);
    var yieldRow = document.createElement("div");
    yieldRow.className = "row yield";
    var yieldName = document.createElement("div");
    yieldName.className = "name";
    yieldName.textContent = "只听自己的歌单时自动暂停";
    var box = document.createElement("input");
    box.type = "checkbox";
    box.className = "chk";
    box.checked = true;
    autoYieldBox = box;
    yieldRow.appendChild(yieldName);
    yieldRow.appendChild(box);
    body.appendChild(yieldRow);
    var hintY = document.createElement("div");
    hintY.className = "hint";
    hintY.textContent = "开着漫游时，如果连续两首都换成了不是漫游推荐的歌（比如你自己去歌单点歌），就自动暂停漫游：不再补歌、不再推荐。已经进了队列的歌不会被删掉；想继续点「开始漫游」即可。";
    body.appendChild(hintY);
  }

  var foot = document.createElement("div");
  foot.className = "foot";
  var save = document.createElement("button");
  save.className = "primary";
  save.textContent = "保存权重";
  var reset = document.createElement("button");
  reset.className = "ghost";
  reset.textContent = "全部清零";
  var msg = document.createElement("div");
  msg.className = "msg";
  msg.textContent = "数值越大，这个曲风出现得越多";
  foot.appendChild(save);
  foot.appendChild(reset);
  foot.appendChild(msg);

  function unwrap(r) {
    if (r && typeof r === "object" && !Array.isArray(r) && Object.prototype.hasOwnProperty.call(r, "value")) return r.value;
    return r;
  }

  function applyState(state) {
    if (!state) return;
    if (Array.isArray(state.labels) && state.labels.length) labels = state.labels.slice();
    if (Array.isArray(state.groupSizes) && state.groupSizes.length) groupSizes = state.groupSizes.slice();
    buildRows();
    var values = state.values;
    if (Array.isArray(values)) {
      for (var k = 0; k < inputs.length; k++) {
        if (inputs[k] && typeof values[k] === "number") inputs[k].set(values[k]);
      }
    }
    if (Array.isArray(state.sources)) {
      plats = state.sources.slice();
      renderPlats();
    }
    if (state.mode === "single" || state.mode === "all") curMode = state.mode;
    if (typeof state.platformId === "string") curPlatform = state.platformId;
    syncMode();
    if (typeof state.explore === "number" && inputs[labels.length]) inputs[labels.length].set(state.explore);
    if (typeof state.autoYield === "boolean" && autoYieldBox) autoYieldBox.checked = state.autoYield;
    if (state.summary) msg.textContent = "当前：" + state.summary;
  }

  rescan.addEventListener("click", function () {
    rescan.disabled = true;
    rescan.textContent = "扫描中…";
    Promise.resolve()
      .then(function () {
        return ui.invoke("roam.sources.refresh", {});
      })
      .then(function () {
        return ui.invoke("weights.load", {});
      })
      .then(function (r) {
        applyState(unwrap(r));
      })
      .catch(function (e) {
        msg.textContent = "扫描失败：" + (e && e.message ? e.message : e);
      })
      .then(function () {
        rescan.disabled = false;
        rescan.textContent = "重新扫描音源";
      });
  });

  save.addEventListener("click", function () {
    var values = [];
    for (var k = 0; k < inputs.length; k++) values.push(inputs[k] ? inputs[k].get() : 0);
    save.disabled = true;
    Promise.resolve()
      .then(function () {
        return ui.invoke("weights.save", {
          source: "roam-weights",
          values: values,
          explore: inputs[labels.length] ? inputs[labels.length].get() : 0,
          autoYield: autoYieldBox ? !!autoYieldBox.checked : true,
          mode: curMode,
          platformId: curMode === "single" ? curPlatform : ""
        });
      })
      .then(function (r) {
        r = unwrap(r);
        applyState(r);
        msg.textContent = "已保存" + (r && r.summary ? "：" + r.summary : "");
      })
      .catch(function (e) {
        msg.textContent = "保存失败：" + (e && e.message ? e.message : e);
      })
      .then(function () {
        save.disabled = false;
      });
  });

  reset.addEventListener("click", function () {
    Promise.resolve()
      .then(function () {
        return ui.invoke("weights.reset", {});
      })
      .then(function (r) {
        r = unwrap(r);
        applyState(r);
        msg.textContent = "已全部清零（纯相似推荐）";
      })
      .catch(function (e) {
        msg.textContent = "清零失败：" + (e && e.message ? e.message : e);
      });
  });

  ui.root.replaceChildren(style, head, body, foot);

  Promise.resolve()
    .then(function () {
      return ui.invoke("weights.load", {});
    })
    .then(function (r) {
      applyState(unwrap(r));
    })
    .catch(function () {});

  return function () {};
}

/* ==== 72-views-extra.js ==== */
/* ============ 使用说明抽屉（对外发布版文案） ============ */
function ViewHelp(ui) {
  var style = document.createElement("style");
  style.textContent = [
    ":root { color-scheme: light dark; }",
    "body { margin: 0; }",
    ".wrap { padding: 22px 26px 40px; font: 14px/1.75 system-ui, 'Microsoft YaHei', sans-serif; }",
    "h1 { font-size: 20px; margin: 0 0 4px; }",
    ".sub { opacity: .6; font-size: 12px; margin-bottom: 22px; }",
    "h2 { font-size: 15px; margin: 26px 0 10px; padding-bottom: 6px; border-bottom: 1px solid rgba(127,127,127,.22); }",
    "p { margin: 0 0 10px; }",
    "b { font-weight: 600; }",
    ".tip { padding: 10px 12px; border-radius: 8px; background: rgba(64,158,255,.10); margin: 0 0 10px; }",
    "ul { margin: 0 0 10px; padding-left: 20px; }",
    "li { margin: 0 0 6px; }",
    ".muted { opacity: .65; font-size: 12px; }",
    ".head { position: sticky; top: 0; z-index: 2; padding: 12px 26px; backdrop-filter: blur(8px); background: rgba(127,127,127,.08); border-bottom: 1px solid rgba(127,127,127,.18); }",
    ".back { font: inherit; font-size: 13px; padding: 6px 14px; border-radius: 8px; cursor: pointer; border: 1px solid rgba(127,127,127,.35); background: transparent; color: inherit; }",
    ".back:hover { background: rgba(127,127,127,.16); }"
  ].join("\n");

  var wrap = document.createElement("div");
  wrap.className = "wrap";
  wrap.innerHTML = [
    "<h1>私人漫游 · 使用说明</h1>",
    '<div class="sub">v0.7.3 · 跨平台无限续播：以当前播放的歌为起点，在已启用的音乐源之间持续推荐，队列快放完时自动补歌</div>',

    "<h2>这个插件做什么</h2>",
    "<p>私人漫游只负责「推什么歌」，不提供音源、不登录账号、不下载文件。它把你已安装的音乐源插件（QQ 音乐、网易云、酷狗、酷我、咪咕、汽水、Apple Music 等）当作候选池，按「像不像当前这首」打分挑歌，把结果写进播放队列。</p>",
    "<p>因为播放始终交给原来的音源插件，所以音质、歌词、封面、下载、一起听这些能力，和你平时用那个音源时完全一样。</p>",

    "<h2>开始使用</h2>",
    "<p><b>第 0 步 · 准备音源</b>：先在澜音里至少启用一个音乐源插件，并在「设置 → 音乐源与音质」里选好当前音源。没有音源插件时本插件补不到任何歌。</p>",
    "<p><b>① 开始漫游</b>：播放任意一首歌，然后打开侧栏的「私人漫游」点「开始漫游」。它会以这首歌为种子，立刻补几首进队列并开始播放。</p>",
    "<p><b>② 之后不用管</b>：队列剩余不多时会自动补歌，始终留一点余量，可以一直听下去。</p>",
    "<p><b>③ 换口味</b>：点「换一批」立刻追加新推荐；点「不喜欢当前这首」跳过并减少同类；想按曲风听，去「曲风权重设置」。</p>",

    "<h2>面板上的按钮</h2>",
    "<ul>",
    "<li><b>开始 / 停止漫游</b>：开关自动续歌。停止后已经进了队列的歌不会被删掉。</li>",
    "<li><b>换一批</b>：马上追加新推荐，不清空现有队列。</li>",
    "<li><b>不喜欢当前这首</b>：这首歌加入本插件的黑名单，它的主艺人一段时间内不再出现，并自动切到下一首。黑名单只存在本地。</li>",
    "<li><b>每日推荐</b>：打开今天这 30 首（本地算法生成，每天自动换新），可以「播放全部」一次性加进队列，也可以单曲「播放」。</li>",
    "<li><b>曲风权重设置</b>：43 个曲风各给 0–100 的权重，顶部还能切换「全平台 / 单一平台」的推荐范围；旁边的「重新扫描音源」能在音源插件后启或登录后刷新平台列表。</li>",
    "<li><b>公告（本页）</b>：插件管理卡片右侧「⋯」菜单里也能打开。</li>",
    "</ul>",

    "<h2>推荐范围：全平台还是单平台</h2>",
    "<p><b>全平台混合（默认）</b>：已启用的所有音源一起出候选，谁的歌合适就推谁，同一首歌只保留一次。</p>",
    "<p><b>单一平台</b>：只用你选中的那个平台的热歌与搜索来补歌，适合「今天只听网易云」这种场景。选中的平台不可用时会自动退回全平台，避免推荐空掉。</p>",
    "<p>榜单和搜索都按当前范围取：单平台模式只拉那个平台的榜单，不再跨平台找同曲版本。</p>",

    "<h2>候选是怎么来的</h2>",
    "<p>四路混在一起，再按相似度打分排序：</p>",
    "<ul>",
    "<li><b>同艺人的其他作品</b>：最像当前这首。</li>",
    "<li><b>同曲的跨平台版本</b>：同一首歌在别的平台的版本（单平台模式下不做）。</li>",
    "<li><b>曲风搜索</b>：按你设的曲风权重发检索词，比例混合。</li>",
    "<li><b>各平台榜单</b>：冷启动、或者相似候选不够时兜底。</li>",
    "</ul>",
    "<p>排序还会考虑：排除当前正在播的、排除最近听过的（默认 12 小时窗口）、同一艺人短时间内不过密、按「纯音乐权重」决定器乐作品的出现比例。</p>",
    "<p><b>具体实现（想看细节的话）：</b></p>",
    "<ul>",
    "<li>先按权重抽 5 条查询：同艺人 ×2、同曲跨平台 ×1、曲风 ×2（单平台模式下不跨平台）。</li>",
    "<li>再按权重挑 1 个平台，随机取它的一个榜单，取一页后打乱。</li>",
    "<li>把结果统一去重（同名同主艺人只留一个）、去掉黑名单与最近听过的，然后打分排序。</li>",
    "<li>打分 = 1 + 同艺人加成 2.5 + 榜单来源加成 0.4 + 0~1.4 的随机扰动；纯音乐再乘一个你设的权重系数。</li>",
    "<li>最后按「探索度」从随机探索池里抽对应比例的歌补进来，再整体打乱顺序。</li>",
    "</ul>",

    "<h2>探索度：想听点没听过的</h2>",
    "<p>曲风权重抽屉最下面的「探索」里有 <b>探索度 0–100</b> 这一根滑条，用法和曲风权重一样：</p>",
    "<ul>",
    "<li><b>0</b>：纯相似推荐，只顺着当前这首找。</li>",
    "<li><b>50</b>：每补 4 首里大约 2 首是随机探索。</li>",
    "<li><b>100</b>：基本全是随机探索，适合想听杂一点、冷门一点的时候。</li>",
    "</ul>",
    "<p>随机探索不是「从全库乱抽」——音源插件没有这种接口。它是用随机检索词（单字、字母、年份、常见词）向随机平台发搜索，再随机取一个平台的随机榜单，拿到结果后同样去重、去黑名单、排除最近听过的，所以不会重复、也不会跳出你启用的音源。</p>",

    "<h2>曲风权重怎么算</h2>",
    "<p><b>数值是相对比例，不是百分比。</b>例如 华语 100 + 民谣 50，大约每 3 首里 2 首华语、1 首民谣。</p>",
    "<p><b>0 表示完全不选这个曲风。</b>想让某一种多一点，把别的调低通常比把它拉满更有效。</p>",
    "<p><b>全部为 0 就是纯相似推荐</b>：只按「像不像当前这首」找歌，不主动掺曲风。为了防止越听越窄，这时每批仍会补 1 首来自榜单的歌。</p>",
    "<p><b>保存后候选池会重建。</b>正在播放时重建需要几秒，期间原有的补歌不受影响。</p>",

    "<h2>只听自己的歌单时自动暂停</h2>",
    "<p>曲风权重抽屉最下面「行为」里有 <b>只听自己的歌单时自动暂停</b> 开关（默认开）。开着漫游、你自己去别的歌单连点播了两首</p>",
    "<p>不是漫游推荐的歌，漫游就会自动暂停：<b>不再补歌、不再推荐</b>。已经进了播放队列的歌不会被删除，想继续听点一下「开始漫游」即可。</p>",
    "<p>如果你希望漫游一直往队列里加歌（哪怕你在听别的东西），把这个开关关掉就行。</p>",    "<h2>注意事项</h2>",
    '<div class="tip">本插件需要「播放任意音源的歌曲」「拦截播放操作」两项权限——前者用于把跨平台的歌写进队列，后者用于在队列快播完时接手切歌。第一次点「开始漫游」时澜音会弹窗申请，你可以随时在「设置 → 插件管理 → 权限」里撤销。</div>',
    "<ul>",
    "<li><b>不需要登录</b>：走各平台公开接口与已安装音源插件的能力；接口有变动时可能需要更新插件版本。</li>",
    "<li><b>同歌去重按「歌名 + 主艺人」</b>：翻唱、现场版、不同版权版本会被当成同一首挡掉。</li>",
    "<li><b>一起去听房间里不会生效</b>：澜音禁止插件在房间里改队列。</li>",
    "<li><b>本插件不下载、不写标签、不改本地文件</b>，只读取各音源的搜索结果与榜单。</li>",
    "<li><b>停止插件或卸载后</b>，队列里已经加进去的歌不会消失，只是不再自动补。</li>",
    "</ul>",

    "<h2>数据与隐私</h2>",
    "<ul>",
    "<li>配置（曲风权重、推荐范围、补歌参数）和状态（候选池、最近播放、黑名单）只存在本机插件自己的存储里，不上传。</li>",
    "<li>不收集任何账号信息，也不读取你的播放历史文件；「最近听过」只按本插件运行期间实际发生的播放记录算。</li>",
    "<li>网络请求只发往你已安装的音源插件所使用的接口，本插件自身不额外请求第三方服务。</li>",
    "</ul>",

    "<h2>常见问题</h2>",
    "<p><b>点了开始漫游没反应？</b>多半是没授予「播放任意音源的歌曲」权限，或者当前没有可用音源。看面板描述行里的提示，再点一次。</p>",
    "<p><b>补的歌风格太杂？</b>把不想要的曲风权重设成 0，只留两三个想要的；或者用「单一平台」缩小范围。</p>",
    "<p><b>队列里没有自动补？</b>队列剩余还多的时候不会补，先把漫游打开并让它播到接近尾声；也可以在面板点「换一批」立刻追加。</p>",
    "<p><b>为什么会推荐到我没听过的语言？</b>曲风权重里有对应的语种项，设成 0 即可排除。</p>",

    '<h2>关于</h2>',
    '<p class="muted">私人漫游 v3 · 基于澜音 2.0+ 插件架构（manifestVersion 3）重写。原始 v2 版本在 <code>plugins-dev/roam/</code>，v3 版本在 <code>plugins-dev/roam-v3/</code>。问题反馈请带上插件版本号与「设置 → 插件管理 → 权限」里的授权状态。</p>'
  ].join("");

  var head = document.createElement("div");
  head.className = "head";
  var back = document.createElement("button");
  back.className = "back";
  back.textContent = "← 返回漫游面板";
  back.addEventListener("click", function () {
    Promise.resolve()
      .then(function () {
        return ui.invoke("roam.openPanel", {});
      })
      .catch(function () {})
      .then(function () {
        try {
          if (typeof ui.close === "function") ui.close();
        } catch (e) {}
      });
  });
  head.appendChild(back);

  ui.root.replaceChildren(style, head, wrap);
  return function () {};
}

/* ==== 80-activate.js ==== */
/* ============ 入口 ============ */
var effects = [];
var prefetchTimer = null;

function schedulePrefetch(operation) {
  if (prefetchTimer) return;
  prefetchTimer = setTimeout(function () {
    prefetchTimer = null;
    if (!R.cfg.enabled) return;
    if (R.mem.pool.length >= Math.max(4, num(R.cfg.keepAhead, 6))) return;
    void fillPool(operation, false);
  }, 1200);
}

function clearPrefetch() {
  if (prefetchTimer) {
    clearTimeout(prefetchTimer);
    prefetchTimer = null;
  }
}

async function hookPlayerPlay(op) {
  try {
    var track = op && op.input ? op.input.track : null;
    if (!track || !track.ref) return;
    var artists = track.metadata && Array.isArray(track.metadata.artists) ? track.metadata.artists : [];
    R.mem.seed = {
      ref: { kind: "track", id: String(track.ref.id || ""), providerId: String(track.ref.providerId || "") },
      title: String(track.title || ""),
      metadata: { artists: artists }
    };
    if (R.cfg.enabled && R.mem.pool.length < Math.max(4, num(R.cfg.keepAhead, 6))) {
      schedulePrefetch(op.operation);
    }
  } catch (e) {
    log("debug", "记录起播种子失败", { error: errMsg(e) });
  }
}

async function hookPlayerNext(op) {
  try {
    if (!R.cfg.enabled) return;
    var input = (op && op.input) || {};
    if (input.reason === "error") return;
    log("debug", "漫游切歌", {
      reason: String(input.reason || ""),
      pool: R.mem.pool.length,
      remain: remainingAfterCurrent(R.mem.queue, R.mem.player)
    });
    if (!R.mem.pool.length) {
      // 池子空时先补货（异步，不阻塞本次切歌）
      schedulePrefetch(op.operation);
      if (R.cfg.enabled) void fillPool(op.operation, false);
      return;
    }
    await ensureAhead(op.operation, input.reason || "ended");
  } catch (e) {
    log("warn", "切歌续播失败", { error: errMsg(e) });
  }
}

async function hookQueueEnded(op) {
  try {
    if (!R.cfg.enabled) return;
    log("info", "漫游队列结束", { pool: R.mem.pool.length });
    if (R.mem.pool.length) {
      op.preventDefault();
      void resumeFromPool(op.operation);
      return;
    }
    // 池子空了：先不拦截，后台补货后自己接着放
    void (async function () {
      try {
        await fillPool(op.operation, true);
        if (R.mem.pool.length) await resumeFromPool(op.operation);
      } catch (e) {
        log("warn", "队列结束后补货失败", { error: errMsg(e) });
      }
    })();
  } catch (e) {
    log("warn", "队列结束续播失败", { error: errMsg(e) });
  }
}

/* ---------- 自动让位：用户去听自己的歌单时暂停漫游 ---------- */
function trackIsMine(ref) {
  if (!ref) return true;
  var id = String(ref.id || "");
  if (!id) return true;
  if (R.mem.mineIds && R.mem.mineIds[id]) return true;
  var pool = R.mem.pool || [];
  for (var i = 0; i < pool.length; i++) {
    if (pool[i] && pool[i].ref && String(pool[i].ref.id) === id) return true;
  }
  var daily = R.mem.daily || [];
  for (var j = 0; j < daily.length; j++) {
    if (daily[j] && daily[j].ref && String(daily[j].ref.id) === id) return true;
  }
  return false;
}

function evaluateAutoYield(state) {
  if (!R.cfg.enabled) {
    R.mem.foreign = 0;
    return;
  }
  var track = state && state.track;
  var ref = track && track.ref;
  var id = ref ? String(ref.id || "") : "";
  if (!id || id === R.mem.lastTrackId) return;
  R.mem.lastTrackId = id;
  if (trackIsMine(ref)) {
    R.mem.foreign = 0;
    return;
  }
  R.mem.foreign = num(R.mem.foreign, 0) + 1;
  if (R.cfg.autoYield === false) return;
  if (R.mem.foreign < 2) return;
  R.cfg.enabled = false;
  R.mem.foreign = 0;
  saveConfig();
  log("info", "检测到连续听自己的歌，已自动暂停漫游", { track: String(track.title || "") });
  toast("检测到你在听自己的歌单，漫游已自动暂停；想继续就点「开始漫游」", "info");
}

function onPlayerChanged(state) {
  try {
    if (!state) return;
    R.mem.player = state;
    if (state.track) R.mem.seed = cleanEntity(state.track);
    evaluateAutoYield(state);
  } catch (e) {
    log("debug", "同步播放状态失败", { error: errMsg(e) });
  }
}

function onQueueChanged(state) {
  try {
    if (state && Array.isArray(state.items)) R.mem.queue = state;
  } catch (e) {
    log("debug", "同步队列状态失败", { error: errMsg(e) });
  }
}

function safeAdd(disposable) {
  if (!disposable) return;
  if (typeof disposable.dispose === "function") effects.push(disposable);
  else if (typeof disposable === "function") effects.push({ dispose: disposable });
}

var rescanTimers = [];

async function LogicMain(ctx) {
  R.ctx = ctx;
  R.id = String((ctx.plugin && ctx.plugin.id) || "");
  R.mem.startedAt = nowMs();
  log("info", "私人漫游 v3 启动", { host: ctx.host && ctx.host.apiVersion });

  await loadStore();

  /* 动作：名字与 v2 面板一致 */
  try {
    safeAdd(ctx.actions.register("roam.view", actionView));
    safeAdd(ctx.actions.register("roam.dailyView", actionDailyView));
    safeAdd(ctx.actions.register("roam.start", actionStart));
    safeAdd(ctx.actions.register("roam.stop", actionStop));
    safeAdd(ctx.actions.register("roam.refresh", actionRefresh));
    safeAdd(ctx.actions.register("roam.dislike", actionDislike));
    safeAdd(ctx.actions.register("roam.dislikeItem", actionDislikeItem));
    safeAdd(ctx.actions.register("roam.play", actionPlay));
    safeAdd(ctx.actions.register("roam.daily", actionDaily));
    safeAdd(ctx.actions.register("roam.refreshDaily", actionRefreshDaily));
    safeAdd(ctx.actions.register("roam.playDaily", actionPlayDaily));
    safeAdd(ctx.actions.register("roam.back", actionBack));
    safeAdd(ctx.actions.register("roam.reset", actionReset));
    safeAdd(ctx.actions.register("roam.openPanel", actionOpenPanel));
    safeAdd(ctx.actions.register("roam.help", actionHelp));
    safeAdd(ctx.actions.register("roam.openWeights", actionOpenWeights));
    safeAdd(ctx.actions.register("weights.load", actionWeightsLoad));
    safeAdd(ctx.actions.register("weights.save", actionWeightsSave));
    safeAdd(ctx.actions.register("weights.reset", actionWeightsReset));
    safeAdd(ctx.actions.register("roam.snapshot", actionSnapshot));
    safeAdd(ctx.actions.register("roam.sources.refresh", actionSourcesRefresh));
  } catch (e) {
    log("error", "注册漫游动作失败", { error: errMsg(e) });
  }

  /* 不注册任何音源：本插件只消费别人（聆澜等）提供的音源，
     避免出现在「设置 → 音乐源与音质」里抢走全局「当前插件」。 */

  /* Hook：无缝续播 */
  try {
    if (ctx.hooks) {
      safeAdd(ctx.hooks.on("player.play", hookPlayerPlay, { priority: "late" }));
      safeAdd(ctx.hooks.on("player.next", hookPlayerNext, { priority: "normal" }));
      safeAdd(ctx.hooks.on("player.queueEnded", hookQueueEnded, { priority: "normal" }));
    }
  } catch (e) {
    log("warn", "注册漫游 Hook 失败", { error: errMsg(e) });
  }

  /* 事件：维护队列/播放快照 */
  try {
    if (ctx.events) {
      safeAdd(ctx.events.on("player.changed", onPlayerChanged));
      safeAdd(ctx.events.on("queue.changed", onQueueChanged));
    }
  } catch (e) {
    log("warn", "注册漫游事件失败", { error: errMsg(e) });
  }

  /* 首次扫描音源（不联网，只问宿主） */
  /* 启动时宿主里 v2 音源插件注册得比我们晚，单次扫描不一定看得到它们：
     先用上次的缓存顶上，再在 2.5s / 7s / 15s / 30s 各补扫一次 */
  try {
    var cached = await loadSourceCache();
    if (cached.length && !R.mem.sources.length) {
      R.mem.sources = cached;
      log("debug", "音源缓存已载入", { count: cached.length });
    }
  } catch (e) {
    log("debug", "载入音源缓存失败", { error: errMsg(e) });
  }  try {
    await refreshSources(null);
  } catch (e) {
    log("debug", "启动扫描音源失败", { error: errMsg(e) });
  }


  try {
    var delays = [2500, 7000, 15000, 30000];
    for (var d = 0; d < delays.length; d++) {
      (function (ms) {
        var t = setTimeout(function () {
          void refreshSources(null, { force: true });
        }, ms);
        rescanTimers.push(t);
      })(delays[d]);
    }
  } catch (e) {
    log("debug", "安排音源补扫失败", { error: errMsg(e) });
  }

  /* 音源上下线（别的插件启停、登录态变化）时自动重扫 */
  try {
    if (ctx.music && typeof ctx.music.on === "function") {
      safeAdd(ctx.music.on("sources.changed", function () {
        void refreshSources(null);
      }));
    }
  } catch (e) {
    log("debug", "订阅音源变化失败", { error: errMsg(e) });
  }

  /* 权限：announce 类的 music.control / player.intercept 必须运行时申请，不阻塞启动 */
  void ensurePermissions();

  return function dispose() {
    for (var q = 0; q < rescanTimers.length; q++) { try { clearTimeout(rescanTimers[q]); } catch (e) {} }
    rescanTimers = [];
    clearPrefetch();
    for (var i = 0; i < effects.length; i++) {
      try {
        effects[i].dispose();
      } catch (e) {
        /* 忽略 */
      }
    }
    effects = [];
    void saveStateNow();
  };
}

/* ==== 99-tail.js ==== */
exports.activate = LogicMain;
exports.surfaces = {
  weights: ViewWeights,
  help: ViewHelp
};

exports.resources = {
  "icon.roam": { type: "base64", mime: "image/png", value: "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" }
};
