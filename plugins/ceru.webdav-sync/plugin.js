exports.manifest = {
  manifestVersion: 2,
  id: "ceru.webdav-sync",
  name: "音枢歌单同步",
  version: "0.3.5",
  description: "把澜音歌单接入音枢同步服务，与栖弦、洛雪 LX-X 双向同步：本地增删自动上传，远端增删自动生效；也能和朋友共用一个空间，一起维护同一份歌单。",
  author: "Yecho",
  license: "MIT",
  engines: {
    hostApi: "^2.0.0",
    logicRuntime: "ceru-js@1",
    uiSchema: "^1.0.0"
  },
  modules: {
    logic: {
      entry: "logic.main"
    },
    surfaces: [
      {
        id: "settings",
        kind: "schema",
        entry: "schema.settings"
      }
    ]
  },
  contributes: {
    commands: [
      {
        id: "settings",
        title: "连接同步服务",
        action: "settings.open",
        view: "settings"
      },
      {
        id: "settings.save",
        title: "保存同步配置",
        action: "settings.save"
      },
      {
        id: "sync",
        title: "同步歌单",
        action: "sync.run"
      },
      {
        id: "sync.check",
        title: "自动检测并同步",
        action: "sync.check"
      }
    ],
    settingsPages: [
      {
        id: "settings",
        title: "插件设置",
        view: "settings"
      }
    ]
  },
  permissions: [
    {
      key: "webdav-sync.http",
      name: "network.request",
      reason: "访问你设置的同步服务（歌单同步枢纽），提交本地歌单并拉取合并结果"
    },
    {
      key: "webdav-sync.lan",
      name: "network.private",
      optional: true,
      reason: "连接本机或局域网内的同步服务"
    },
    {
      key: "webdav-sync.write",
      name: "library.write",
      reason: "把合并结果里的歌导入澜音本地歌单"
    },
    {
      key: "webdav-sync.read",
      name: "library.read",
      reason: "读取澜音本地歌单，按同名匹配并提交给同步服务"
    },
    {
      key: "webdav-sync.background",
      name: "background.run",
      optional: true,
      reason: "开启「自动同步」时，定时检测歌单变化并在后台自动同步"
    },
    {
      key: "webdav-sync.delete",
      name: "library.delete",
      optional: true,
      reason: "宿主向插件开放删除接口时，把枢纽侧判定删除的曲目从澜音本地歌单移除；当前澜音版本未开放该接口，插件只会标记并在后续同步中不再把这些曲目写回枢纽"
    }
  ],
  dataSchemas: {
    config: 1,
    state: 1
  }
};
exports.package = {
  formatVersion: 2,
  syntax: "js",
  signature: null
};
// Invisible plugin logic
const LogicMain = /* @ceru-self-contained */ async function LogicMain(ctx) {
"use strict";
const __ceru_entry = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    default: () => index_default
  });

  // node_modules/@shiqianjiang/ceru-plugin-sdk/dist/index.js
  function definePlugin(entry) {
    return entry;
  }

  // src/sync-core.js
  var RESOLVABLE = /* @__PURE__ */ new Set(["wy", "tx", "kw", "kg", "mg"]);
  var QUALITY_RANK = [
    "master",
    "atmos_plus",
    "atmos",
    "hires",
    "flac24bit",
    "flac",
    "320k",
    "192k",
    "128k"
  ];
  var BATCH_SIZE = 300;
  function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  }
  function str(value) {
    if (value == null) return "";
    return typeof value === "string" ? value.trim() : String(value);
  }
  function parseMinutes(value) {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 1 && n <= 60) return Math.round(n);
    return 3;
  }
  function canonicalize(value) {
    if (Array.isArray(value)) return value.map(canonicalize);
    if (value && typeof value === "object") {
      const out = {};
      Object.keys(value).sort().forEach((k) => {
        out[k] = canonicalize(value[k]);
      });
      return out;
    }
    return value;
  }
  function contentHash(value, cryptoMod) {
    const text = JSON.stringify(canonicalize(value));
    if (cryptoMod && typeof cryptoMod.createHash === "function") {
      try {
        const h = cryptoMod.createHash("sha256");
        h.update(text);
        const digest = h.digest("hex");
        if (typeof digest === "string" && digest) return digest;
      } catch {
      }
    }
    let a = 2166136261;
    let b = 3421674724;
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      a = Math.imul(a ^ c, 16777619) >>> 0;
      b = Math.imul(b ^ (c ^ 93), 16777619) >>> 0;
    }
    return a.toString(16).padStart(8, "0") + b.toString(16).padStart(8, "0");
  }
  function base64Encode(input) {
    const text = String(input);
    const bytes = [];
    for (let i = 0; i < text.length; i++) {
      const code = text.codePointAt(i);
      if (code <= 127) bytes.push(code);
      else if (code <= 2047) {
        bytes.push(192 | code >> 6, 128 | code & 63);
      } else if (code <= 65535) {
        bytes.push(224 | code >> 12, 128 | code >> 6 & 63, 128 | code & 63);
      } else {
        bytes.push(
          240 | code >> 18,
          128 | code >> 12 & 63,
          128 | code >> 6 & 63,
          128 | code & 63
        );
        i++;
      }
    }
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let out = "";
    for (let i = 0; i < bytes.length; i += 3) {
      const b0 = bytes[i];
      const b1 = bytes[i + 1];
      const b2 = bytes[i + 2];
      out += alphabet[b0 >> 2];
      out += alphabet[(b0 & 3) << 4 | (b1 === void 0 ? 0 : b1) >> 4];
      out += b1 === void 0 ? "=" : alphabet[(b1 & 15) << 2 | (b2 === void 0 ? 0 : b2) >> 6];
      out += b2 === void 0 ? "=" : alphabet[b2 & 63];
    }
    return out;
  }
  var KEY_SEP = "\0";
  function trackKey(source, songId) {
    const s = str(source);
    const id = str(songId);
    if (!s || !id) return "";
    return s + KEY_SEP + id;
  }
  function localItemKey(item) {
    const ref = asRecord(item && item.ref);
    if (!ref) return "";
    return trackKey(ref.providerId, ref.id);
  }
  function isWritableLocalItem(item) {
    const ref = asRecord(item && item.ref);
    if (!ref) return false;
    return RESOLVABLE.has(str(ref.providerId)) && !!str(ref.id);
  }
  function hubTrackKey(track) {
    const rec = asRecord(track);
    if (!rec) return "";
    return trackKey(rec.source, rec.songId);
  }
  var MAX_TITLE = 4096;
  var MAX_ID = 2048;
  function clampText(value, max) {
    const text = str(value);
    return text.length > max ? text.slice(0, max) : text;
  }
  function itemToHubTrack(item) {
    if (!isWritableLocalItem(item)) return null;
    const ref = asRecord(item.ref);
    const source = str(ref.providerId);
    const songId = str(ref.id);
    const metadata = asRecord(item.metadata) || {};
    const singer = (Array.isArray(metadata.artists) ? metadata.artists : []).map((a) => str(a)).filter(Boolean).join("、");
    const album = str(asRecord(metadata.album) && asRecord(metadata.album).title);
    const picUrl = str(metadata.artworkUrl);
    const qualities = Array.isArray(metadata.qualities) ? metadata.qualities : [];
    const ranked = QUALITY_RANK.filter((q) => qualities.includes(q));
    const quality = ranked[0] || "";
    const duration = Number.isFinite(metadata.durationMs) ? metadata.durationMs : void 0;
    const out = {
      source,
      songId,
      title: clampText(item.title, MAX_TITLE) || songId
    };
    if (singer) out.singer = clampText(singer, MAX_TITLE);
    if (album) out.album = clampText(album, MAX_TITLE);
    if (picUrl) out.picUrl = clampText(picUrl, MAX_TITLE);
    if (quality) out.quality = clampText(quality, MAX_TITLE);
    if (duration !== void 0) out.durationMs = duration;
    return out;
  }
  function hubTrackToItem(track, pluginId) {
    const rec = asRecord(track);
    if (!rec) return null;
    const source = str(rec.source);
    const id = str(rec.songId);
    if (!source || source.length > MAX_ID) return null;
    if (!id || id.length > MAX_ID) return null;
    const title = clampText(rec.title, MAX_TITLE) || id;
    const singer = str(rec.singer);
    const album = str(rec.album);
    const picUrl = str(rec.picUrl);
    const quality = str(rec.quality);
    const duration = Number.isFinite(rec.durationMs) ? rec.durationMs : void 0;
    const artists = singer ? singer.split("、").map((p) => clampText(p, MAX_TITLE)).filter(Boolean) : [];
    return {
      ref: {
        pluginId,
        providerId: source,
        kind: "track",
        id,
        scope: "provider"
      },
      title,
      ...singer ? { subtitle: clampText(singer, MAX_TITLE) } : {},
      playable: RESOLVABLE.has(source),
      capabilities: ["music.resolve@1", "music.lyrics@1"],
      metadata: {
        artists,
        ...album ? { album: { title: clampText(album, MAX_TITLE) } } : {},
        ...quality ? { qualities: [clampText(quality, MAX_TITLE)] } : {},
        ...picUrl ? { artworkUrl: clampText(picUrl, MAX_TITLE) } : {},
        ...duration === void 0 ? {} : { durationMs: duration }
      }
    };
  }

  // src/index.js
  var LOG_PREFIX = "[音枢歌单同步]";
  var STORAGE_KEY = "connection.v1";
  var DEVICE_KEY = "device.v1";
  var savedDeviceName = "";
  var AUTO_SYNC_TASK_ID = "webdav-sync.auto-sync";
  var REMOTE_HASH_KEY = "remote-hash.v2";
  var LOCAL_HASH_KEY = "local-hash.v2";
  var LAST_VIEW_KEY = "last-view.v2";
  var LAST_SYNC_KEY = "last-sync.v1";
  var PENDING_KEY = "pending-imports.v1";
  var PREV_SUBMIT_KEY = "prev-submit.v1";
  var HUB_DELETED_KEY = "hub-deleted.v1";
  var HTTP_KEY = "webdav-sync.http";
  var LAN_KEY = "webdav-sync.lan";
  var READ_KEY = "webdav-sync.read";
  var WRITE_KEY = "webdav-sync.write";
  var BG_KEY = "webdav-sync.background";
  var DELETE_KEY = "webdav-sync.delete";
  var SYNC_PATH = "/ceru/sync-v1.json";
  var index_default = definePlugin(async (ctx) => {
    let config = null;
    let status = "尚未连接";
    let busy = false;
    let cryptoMod = null;
    try {
      cryptoMod = ctx.modules.require("@ceru/crypto");
    } catch {
      cryptoMod = null;
    }
    let lastOperationRef = null;
    let lastSyncAt = null;
    let lastSyncCommitted = true;
    let pendingImports = {};
    function fault(code, message) {
      return Object.assign(new Error(message), { code });
    }
    function log(level, message, data) {
      try {
        const channel = ctx && ctx.log;
        const fn = channel && channel[level] || channel && channel.info;
        if (typeof fn !== "function") return;
        fn(LOG_PREFIX + " " + message, data);
      } catch {
      }
    }
    function hasher(value) {
      return contentHash(value, cryptoMod);
    }
    function normalizeServer(value) {
      let raw = str(value);
      if (!raw) throw fault("INVALID_INPUT", "请输入同步服务地址");
      if (!raw.includes("://")) raw = "https://" + raw;
      let url;
      try {
        url = new URL(raw);
      } catch {
        throw fault("INVALID_INPUT", "同步服务地址无效，请输入完整 http(s) 地址");
      }
      if (!["http:", "https:"].includes(url.protocol))
        throw fault("INVALID_INPUT", "同步服务地址只支持 HTTP(S)");
      if (url.username || url.password)
        throw fault("INVALID_INPUT", "请把账号密码填到下方字段，不要放进地址里");
      return url.origin + url.pathname.replace(/\/+$/, "");
    }
    function syncUrl() {
      const base = (config.serverUrl || "").replace(/\/+$/, "");
      return base + SYNC_PATH;
    }
    function authHeader() {
      return "Basic " + base64Encode(config.username + ":" + config.password);
    }
    const DEVICE_NAME_RE = /^[A-Za-z0-9_-]{1,32}$/;
    const DEFAULT_DEVICE_NAME = "ceru-music";
    function deviceHeader() {
      const name = config && config.deviceName ? str(config.deviceName).trim() : "";
      if (!name) return {};
      if (!DEVICE_NAME_RE.test(name)) {
        log(
          "warn",
          `设备名「${name}」不合法（只能用字母、数字、-、_，最长 32 位），本次请求未携带设备名；请在插件设置里改一个合法名字`
        );
        return {};
      }
      return { "X-Hub-Device": name };
    }
    async function authorizeHttp(operation) {
      let result = await ctx.permissions.query({ key: HTTP_KEY });
      if (result.status === "prompt")
        result = await ctx.permissions.request({ key: HTTP_KEY, intent: operation && operation.userIntent });
      if (result.status !== "granted") {
        log("error", "网络权限未授予，无法访问同步服务", { status: result && result.status });
        throw fault("PERMISSION_DENIED", "请在插件权限中允许访问网络");
      }
    }
    async function request(method, url, { body, headers, timeoutMs, operation } = {}) {
      try {
        return await rawRequest(method, url, { body, headers, timeoutMs, operation });
      } catch (error) {
        if (error && error.code === "CANCELLED") throw error;
        if (!isLanPermissionError(error)) throw error;
        let status2 = (await ctx.permissions.query({ key: LAN_KEY })).status;
        if (status2 === "prompt" || status2 === "undeclared")
          status2 = (await ctx.permissions.request({ key: LAN_KEY, intent: operation && operation.userIntent })).status;
        if (status2 !== "granted") throw error;
        log("debug", "已获得局域网访问授权，重试本次请求");
        return await rawRequest(method, url, { body, headers, timeoutMs, operation });
      }
    }
    function isLanPermissionError(error) {
      const message = String(error && error.message || "");
      return /局域网|network\.private|private network|private address/i.test(message);
    }
    async function rawRequest(method, url, { body, headers, timeoutMs, operation } = {}) {
      const response = await ctx.http.request({
        permissionKey: HTTP_KEY,
        url,
        method,
        headers: { Authorization: authHeader(), ...deviceHeader(), ...headers || {} },
        ...body === void 0 ? {} : { body },
        timeoutMs: Math.min(6e4, Math.max(1e3, timeoutMs || 2e4)),
        operation
      });
      const raw = response && response.headers || {};
      const normalized = {};
      for (const key of Object.keys(raw)) normalized[key.toLowerCase()] = raw[key];
      return {
        status: Number(response && response.status),
        headers: normalized,
        body: response && response.body
      };
    }
    async function fetchRemote(operation) {
      await authorizeHttp(operation);
      log("debug", "拉取合并结果：GET " + syncUrl());
      let response;
      try {
        response = await request("GET", syncUrl(), { operation });
      } catch (error) {
        if (error && error.code === "CANCELLED") throw error;
        throw fault("NETWORK_ERROR", "无法连接同步服务，请检查地址、网络与权限");
      }
      const { status: code } = response;
      if (code === 401 || code === 403)
        throw fault("AUTH_REQUIRED", "同步服务用户名或密码不正确，请检查");
      if (code === 404)
        throw fault("NOT_FOUND", "同步服务里没有该歌单端点，请确认地址填的是歌单同步枢纽的地址");
      if (code < 200 || code >= 300) throw fault("NETWORK_ERROR", "同步服务返回 HTTP " + code);
      let body = response.body;
      if (typeof body === "string") {
        if (!body.trim()) throw fault("NETWORK_ERROR", "同步服务返回了空内容");
        try {
          body = JSON.parse(body);
        } catch {
          throw fault("NETWORK_ERROR", "同步服务返回的内容不是有效的 JSON");
        }
      }
      if (!asRecord(body)) throw fault("NETWORK_ERROR", "同步服务返回的内容结构无效");
      const playlists = Array.isArray(body.playlists) ? body.playlists : [];
      return { payload: body, hash: hasher({ playlists }) };
    }
    async function submitRemote(submission, operation) {
      await authorizeHttp(operation);
      const body = JSON.stringify(submission);
      log("debug", `提交本地歌单：PUT ${syncUrl()}（${body.length} 字符）`);
      let response;
      try {
        response = await request("PUT", syncUrl(), {
          body,
          headers: { "Content-Type": "application/json" },
          timeoutMs: 6e4,
          operation
        });
      } catch (error) {
        if (error && error.code === "CANCELLED") throw error;
        throw fault("NETWORK_ERROR", "提交本地歌单失败，请检查地址、网络与权限");
      }
      const code = response.status;
      if (code === 401 || code === 403)
        throw fault("AUTH_REQUIRED", "同步服务用户名或密码不正确");
      if (code === 400 || code === 412) {
        const msg = asRecord(response.body) && response.body.error || `HTTP ${code}`;
        throw fault("NETWORK_ERROR", `同步服务拒绝了本次提交（${msg}）`);
      }
      if (code < 200 || code >= 300) throw fault("NETWORK_ERROR", "同步服务返回 HTTP " + code);
      return response.body;
    }
    function hasHostMethod(methods, name) {
      if (!Array.isArray(methods)) return false;
      return methods.some(
        (m) => typeof m === "string" && (m === name || m.endsWith("." + name))
      );
    }
    async function ensureLibraryAccess(operation) {
      let availability;
      try {
        availability = await ctx.capabilities.get("library");
      } catch {
        throw fault("UNSUPPORTED", "当前澜音没有歌单写入能力");
      }
      const methods = availability && availability.methods || [];
      if (!availability || !availability.available || !hasHostMethod(methods, "playlists.import"))
        throw fault("UNSUPPORTED", "当前澜音没有歌单写入能力，请在桌面端使用");
      return operation;
    }
    async function matchLocalPlaylist(playlistName, operation) {
      const listResult = await ctx.library.playlists.list({ permissionKey: READ_KEY, operation });
      const locals = listResult && listResult.items || [];
      const match = locals.find(
        (p) => p && p.ref && p.ref.location === "local" && p.name === playlistName
      );
      return match ? match.ref : void 0;
    }
    async function hardDeleteCapable(operation) {
      let availability;
      try {
        availability = await ctx.capabilities.get("library");
      } catch {
        availability = null;
      }
      const methods = availability && availability.methods || [];
      const declared = hasHostMethod(methods, "playlists.removeTracks");
      if (!declared) {
        log(
          "warn",
          "当前澜音版本过低（<2.2.1，未声明插件删除接口），已跳过本地删除——枢纽侧的删除不会被回写覆盖"
        );
        return { ok: false, reason: "host-too-old" };
      }
      let result;
      try {
        result = await ctx.permissions.query({ key: DELETE_KEY });
        if (result && (result.status === "prompt" || result.status === "undeclared"))
          result = await ctx.permissions.request({ key: DELETE_KEY, intent: operation && operation.userIntent });
      } catch {
        return { ok: false, reason: "not-granted" };
      }
      if (!result || result.status !== "granted") {
        log("warn", "未授权删除，已跳过删除（可在插件设置里重新授权）");
        return { ok: false, reason: "not-granted" };
      }
      const removeTracks = ctx && ctx.library && ctx.library.playlists && ctx.library.playlists.removeTracks;
      if (typeof removeTracks !== "function") {
        log(
          "warn",
          "宿主声明了删除接口但桥上没有该函数（removeTracks 不是函数），已跳过本地删除——请升级澜音；若最新版仍如此请上报"
        );
        return { ok: false, reason: "no-api" };
      }
      return { ok: true };
    }
    async function removeRemoteDeleted(target, items, operation) {
      const payloadItems = items.map((item) => {
        const ref = asRecord(item && item.ref);
        const metadata = asRecord(item && item.metadata);
        if (!ref || !str(ref.providerId) || !str(ref.id)) return null;
        return {
          ref: { kind: "track", providerId: str(ref.providerId), id: str(ref.id), scope: "provider" },
          title: str(item.title) || str(ref.id),
          metadata: {
            artists: Array.isArray(metadata && metadata.artists) ? metadata.artists : [],
            ...metadata && metadata.artworkUrl ? { artworkUrl: str(metadata.artworkUrl) } : {}
          }
        };
      }).filter(Boolean);
      if (!payloadItems.length) return { removed: 0, failed: items.length };
      let result;
      try {
        result = await ctx.library.playlists.removeTracks({
          target,
          items: payloadItems,
          permissionKey: DELETE_KEY,
          operation
        });
      } catch (error) {
        if (error && error.code === "CANCELLED") throw error;
        log("error", `删除未匹配到本地曲目（${items.length} 首），请上报：${error && error.message ? error.message : "未知错误"}`);
        return { removed: 0, failed: items.length };
      }
      const removed = typeof result === "number" ? Math.max(0, Math.min(result, payloadItems.length)) : result && Number.isFinite(result.removed) ? Math.max(0, Math.min(result.removed, payloadItems.length)) : 0;
      const failed = payloadItems.length - removed;
      if (failed) log("error", `删除未匹配到本地曲目（${failed} 首），请上报；已跳过（不会写回云端）`);
      return { removed, failed };
    }
    async function listLocalPlaylists(operation) {
      const listResult = await ctx.library.playlists.list({ permissionKey: READ_KEY, operation });
      const items = listResult && listResult.items || [];
      return items.filter((p) => p && p.ref && p.ref.location === "local" && p.name).map((p) => ({ name: p.name, ref: p.ref }));
    }
    async function readLocalTracks(target, operation) {
      const items = [];
      let cursor;
      let guard = 0;
      do {
        const page = await ctx.library.playlists.getTracks({
          target,
          permissionKey: READ_KEY,
          operation,
          ...cursor ? { cursor } : {}
        });
        const list = page && page.items || [];
        for (const it of list) items.push(it);
        const next = page && page.nextCursor;
        cursor = next && next !== cursor ? next : void 0;
        guard++;
      } while (cursor && guard < 200);
      return items;
    }
    async function importPlaylist(playlistName, items, requestId, operation, target) {
      let added = 0;
      let skipped = 0;
      const starts = [];
      for (let offset = 0; offset < items.length; offset += BATCH_SIZE) starts.push(offset);
      starts.reverse();
      for (const offset of starts) {
        const result = await ctx.library.playlists.import({
          ...target ? { target } : {},
          suggestedName: playlistName,
          items: items.slice(offset, offset + BATCH_SIZE),
          requestId: `${requestId}:${offset}`,
          permissionKey: WRITE_KEY,
          operation
        });
        if (result && result.cancelled) return { cancelled: true, added, skipped, target };
        target = result && result.target || target;
        added += result && result.added || 0;
        skipped += result && result.skipped || 0;
      }
      return { cancelled: false, added, skipped, target };
    }
    async function computeLocalHash(operation) {
      const locals = await listLocalPlaylists(operation);
      const lines = [];
      for (const lp of locals) {
        const tracks = await readLocalTracks(lp.ref, operation);
        const keys = tracks.map(localItemKey).filter(Boolean).sort();
        lines.push(lp.name + "" + keys.join(""));
      }
      lines.sort();
      return hasher(lines);
    }
    async function buildLocalSubmission(operation, excluded) {
      const locals = await listLocalPlaylists(operation);
      const playlists = [];
      let unwritable = 0;
      let withheld = 0;
      for (const lp of locals) {
        const tracks = await readLocalTracks(lp.ref, operation);
        const skip = excluded && excluded[lp.name] ? new Set(excluded[lp.name]) : null;
        const converted = [];
        for (const item of tracks) {
          const track = itemToHubTrack(item);
          if (!track) {
            unwritable++;
            continue;
          }
          if (skip && skip.has(hubTrackKey(track))) {
            withheld++;
            continue;
          }
          converted.push(track);
        }
        playlists.push({ id: String(lp.ref && lp.ref.id) || lp.name, name: lp.name, tracks: converted });
      }
      return { submission: { playlists }, unwritable, withheld };
    }
    async function refreshHubDeleted(marks0, endpointKey, lastView, prevSubmit, deliveredBy, localKeysBy) {
      const next = {};
      for (const name of Object.keys(marks0)) {
        if (!localKeysBy.has(name)) continue;
        const delivered = deliveredBy.get(name);
        if (!delivered) continue;
        const keep = (marks0[name] || []).filter(
          (k) => localKeysBy.get(name).has(k) && !delivered.has(k)
        );
        if (keep.length) next[name] = keep;
      }
      for (const [name, delivered] of deliveredBy) {
        const lastKeys = Array.isArray(lastView[name]) ? lastView[name] : [];
        const submitted = new Set(
          (Array.isArray(prevSubmit[name]) ? prevSubmit[name] : []).map((e) => str(e && e.key)).filter(Boolean)
        );
        const localKeys = localKeysBy.get(name);
        if (!localKeys) continue;
        const mark = new Set(next[name] || []);
        for (const k of lastKeys) {
          if (!k) continue;
          if (!delivered.has(k) && localKeys.has(k) && submitted.has(k)) mark.add(k);
        }
        for (const k of Array.from(mark)) if (delivered.has(k) || !localKeys.has(k)) mark.delete(k);
        if (mark.size) next[name] = Array.from(mark);
        else delete next[name];
      }
      await ctx.storage.set(HUB_DELETED_KEY, { endpoint: endpointKey, marks: next });
      return next;
    }
    async function sleepSafe(ms) {
      try {
        await new Promise((r) => setTimeout(r, ms));
      } catch {
      }
    }
    async function doSync(operation, options = {}) {
      if (!config) throw fault("AUTH_REQUIRED", "请先在「连接同步服务」中保存配置");
      if (busy) throw fault("INVALID_INPUT", "同步正在进行，请稍候");
      busy = true;
      if (operation) lastOperationRef = operation;
      log("info", `开始同步（${options.auto ? "自动" : "手动"}）`);
      try {
        await ensureLibraryAccess(operation);
        const canHardDelete = await hardDeleteCapable(operation);
        const fetched1 = await fetchRemote(operation);
        const merged1 = fetched1.payload.playlists || [];
        const mergedNames1 = new Set(merged1.map((p) => str(p.name)));
        const localHashBefore = await computeLocalHash(operation);
        if (options.checkChange) {
          const prevRemote = await ctx.storage.get(REMOTE_HASH_KEY);
          const prevLocal = await ctx.storage.get(LOCAL_HASH_KEY);
          const remoteChanged = prevRemote !== fetched1.hash;
          const localChanged = prevLocal !== localHashBefore;
          if (!remoteChanged && !localChanged) {
            const pendingNames = Object.keys(pendingImports);
            const pendingTotal = pendingNames.reduce((n, name) => n + (pendingImports[name] || 0), 0);
            if (pendingNames.length) {
              const shown = pendingNames.length <= 2 ? pendingNames.join("、") : `${pendingNames.slice(0, 2).join("、")} 等 ${pendingNames.length} 个`;
              log(
                "info",
                `合并结果没有新变化，但仍有 ${pendingNames.length} 个歌单（共 ${pendingTotal} 首）待手动导入：${pendingNames.join("、")}`
              );
              status = `无新变化；仍有 ${pendingTotal} 首待手动导入（${shown}）——点「立即同步」新建同名歌单即可导入`;
            } else {
              log("debug", "变化检测：合并结果与本地均无变化，跳过本次同步");
              status = "歌单无变化，已是最新";
            }
            await updateState();
            return { unchanged: true, playlists: 0, imported: 0, skipped: 0, pending: pendingTotal };
          }
          log(
            "info",
            "变化检测命中，执行同步" + (remoteChanged ? "（合并结果变化）" : "（本地内容变化）")
          );
        }
        const progress = await createProgress("同步歌单（经合并枢纽）");
        let imported = 0;
        let skipped = 0;
        let noTargetSkipped = 0;
        let playlistsDone = 0;
        let cancelled = false;
        const newPending = [];
        try {
          const lastView = await ctx.storage.get(LAST_VIEW_KEY) || {};
          const prevSubmitBefore = await ctx.storage.get(PREV_SUBMIT_KEY) || {};
          const deliveredBy = /* @__PURE__ */ new Map();
          for (const pl of merged1) {
            const n = str(pl.name);
            if (!n) continue;
            deliveredBy.set(
              n,
              new Set((Array.isArray(pl.tracks) ? pl.tracks : []).map(hubTrackKey).filter(Boolean))
            );
          }
          let hubDeleted = {};
          if (!canHardDelete.ok) {
            const localKeysBy = /* @__PURE__ */ new Map();
            for (const lp of await listLocalPlaylists(operation)) {
              const items = await readLocalTracks(lp.ref, operation);
              localKeysBy.set(lp.name, new Set(items.map(localItemKey).filter(Boolean)));
            }
            const endpointKey = `${str(config.serverUrl)}${str(config.username)}`;
            const stored = asRecord(await ctx.storage.get(HUB_DELETED_KEY));
            const marks0 = stored && stored.endpoint === endpointKey && asRecord(stored.marks) ? stored.marks : {};
            hubDeleted = await refreshHubDeleted(
              marks0,
              endpointKey,
              lastView,
              prevSubmitBefore,
              deliveredBy,
              localKeysBy
            );
            const marked = Object.keys(hubDeleted).reduce((n, k) => n + hubDeleted[k].length, 0);
            if (marked) {
              log(
                "info",
                `有 ${marked} 首已在其他设备删除、本地删不掉（当前澜音未开放删除接口），已不再提交回枢纽`
              );
            }
          }
          for (let i = 0; i < merged1.length; i++) {
            const pl = merged1[i];
            const name = str(pl.name);
            if (!name) continue;
            const plTracks = Array.isArray(pl.tracks) ? pl.tracks : [];
            await progress.update(
              `正在导入歌单 ${i + 1}/${merged1.length}：「${name}」（${plTracks.length} 首）`
            );
            let target;
            try {
              target = await matchLocalPlaylist(name, operation);
            } catch (error) {
              if (error && error.code === "CANCELLED") throw error;
              log("warn", `读取本地歌单「${name}」失败，本次跳过该歌单：${error && error.message}`);
              continue;
            }
            if (!target) {
              const total = plTracks.length;
              if (options.auto || !total) {
                if (total) {
                  noTargetSkipped += total;
                  if (pendingImports[name] !== total) newPending.push(name);
                  pendingImports[name] = total;
                  log(
                    "info",
                    `歌单「${name}」有 ${total} 首待导入，但本地没有同名歌单；自动同步已跳过（请手动同步一次以新建歌单）`
                  );
                } else {
                  delete pendingImports[name];
                }
                continue;
              }
              const items = plTracks.map((t) => hubTrackToItem(t, ctx.plugin.id)).filter(Boolean);
              if (!items.length) {
                delete pendingImports[name];
                continue;
              }
              const outcome = await importPlaylist(
                name,
                items,
                "webdav-sync:" + Date.now() + ":" + i,
                operation,
                void 0
              );
              if (outcome.cancelled) {
                cancelled = true;
                log("info", `歌单「${name}」的新建/导入被取消，本次同步到此为止`);
                break;
              }
              imported += outcome.added;
              skipped += outcome.skipped;
              delete pendingImports[name];
              playlistsDone++;
              continue;
            }
            const localItems = await readLocalTracks(target, operation);
            const localKeys = new Set(localItems.map(localItemKey).filter(Boolean));
            const lastKeys = new Set(Array.isArray(lastView[name]) ? lastView[name] : []);
            const toImport = plTracks.filter(
              (t) => !localKeys.has(hubTrackKey(t)) && !lastKeys.has(hubTrackKey(t))
            );
            if (toImport.length) {
              const items = toImport.map((t) => hubTrackToItem(t, ctx.plugin.id)).filter(Boolean);
              if (items.length) {
                const names = toImport.map((t) => str(t.title) || str(t.songId) || "").filter(Boolean).join("、");
                log("info", `从合并结果导入 ${items.length} 首到「${name}」：${names || "(歌名缺失)"}`);
                const outcome = await importPlaylist(
                  name,
                  items,
                  "webdav-sync:" + Date.now() + ":" + i,
                  operation,
                  target
                );
                if (outcome.cancelled) {
                  cancelled = true;
                  log("info", `歌单「${name}」的导入被取消，本次同步到此为止`);
                  break;
                }
                imported += outcome.added;
                skipped += outcome.skipped;
                delete pendingImports[name];
              }
            }
            playlistsDone++;
          }
          let unwritable = 0;
          let withheld = 0;
          if (!cancelled) {
            const built = await buildLocalSubmission(operation, hubDeleted);
            unwritable = built.unwritable;
            withheld = built.withheld || 0;
            await submitRemote(built.submission, operation);
            const prevSubmit = prevSubmitBefore;
            const nextSubmit = {};
            for (const pl of built.submission.playlists) {
              const tracks = Array.isArray(pl.tracks) ? pl.tracks : [];
              const cur = tracks.map((t) => ({
                key: hubTrackKey(t) || `${str(t.source)}:${str(t.songId)}`,
                title: str(t.title) || str(t.songId) || ""
              })).filter((e) => e.key);
              const prev = Array.isArray(prevSubmit[pl.name]) ? prevSubmit[pl.name] : [];
              const prevByKey = new Map(prev.map((e) => [e.key, e]));
              const curKeys = new Set(cur.map((e) => e.key));
              const added = cur.filter((e) => !prevByKey.has(e.key));
              const removed = prev.filter((e) => !curKeys.has(e.key));
              nextSubmit[pl.name] = cur;
              if (added.length || removed.length) {
                const a = added.map((e) => e.title || e.key).join("、") || "无";
                const r = removed.map((e) => e.title || e.key).join("、") || "无";
                log(
                  "info",
                  `本地变更「${pl.name}」：新增 ${added.length} 首【${a}】，移除 ${removed.length} 首【${r}】`
                );
              }
            }
            await ctx.storage.set(PREV_SUBMIT_KEY, nextSubmit);
          }
          const fetched2 = await fetchRemote(operation);
          const merged2 = fetched2.payload.playlists || [];
          const mergedNames2 = new Set(merged2.map((p) => str(p.name)));
          let cleanCount = 0;
          let deleteFailed = 0;
          let autoDeleted = 0;
          let deleteSkipReason = null;
          for (const pl of merged2) {
            const name = str(pl.name);
            if (!name) continue;
            const remoteKeys = new Set((Array.isArray(pl.tracks) ? pl.tracks : []).map(hubTrackKey).filter(Boolean));
            let target;
            try {
              target = await matchLocalPlaylist(name, operation);
            } catch {
              continue;
            }
            if (!target) continue;
            const localItems = await readLocalTracks(target, operation);
            const cleanItems = localItems.filter(
              (item) => isWritableLocalItem(item) && !remoteKeys.has(localItemKey(item))
            );
            if (!cleanItems.length) continue;
            if (canHardDelete.ok) {
              const res = await removeRemoteDeleted(target, cleanItems, operation);
              autoDeleted += res.removed;
              deleteFailed += res.failed;
            } else {
              cleanCount += cleanItems.length;
              deleteSkipReason = canHardDelete.reason || "not-granted";
              if (deleteSkipReason === "host-too-old")
                log("warn", "澜音版本过低：自动删除需要 2.2.1 及以上，请升级澜音后再同步（已跳过删除）");
              else if (deleteSkipReason === "no-api")
                log(
                  "warn",
                  `有 ${cleanItems.length} 首已在其他设备删除，但当前澜音没有向插件开放删除接口，本地删不掉（已跳过，且不再回写枢纽——否则会把删除复活成待确认卡）`
                );
              else
                log("warn", "未授权删除，已跳过删除（可在插件设置里重新授权）");
            }
          }
          const deletedPlaylists = [];
          const locals = await listLocalPlaylists(operation);
          for (const lp of locals) {
            const name = lp.name;
            if (mergedNames2.has(name)) continue;
            const tracks = await readLocalTracks(lp.ref, operation);
            if (tracks.some(isWritableLocalItem)) {
              deletedPlaylists.push(name);
              log(
                "info",
                `合并结果里已没有歌单「${name}」（被栖弦或并发删除），澜音本地仍保留，需手动删除同名歌单（宿主无删除歌单 API）；不会回写`
              );
            }
          }
          for (const name of Object.keys(pendingImports)) {
            if (!mergedNames2.has(name)) delete pendingImports[name];
          }
          await progress.close();
          const summary = {
            playlists: playlistsDone,
            imported,
            skipped,
            cleanCount,
            autoDeleted,
            unwritable,
            withheld,
            noTargetSkipped,
            cancelled,
            deletedPlaylists: deletedPlaylists.length,
            total: merged1.length
          };
          const now = (/* @__PURE__ */ new Date()).toISOString();
          await ctx.storage.set(LAST_SYNC_KEY, { at: now, ...summary });
          await ctx.storage.set(PENDING_KEY, pendingImports);
          if (options.auto && newPending.length) {
            const total = newPending.reduce((n, name) => n + (pendingImports[name] || 0), 0);
            log("info", `发现 ${newPending.length} 个歌单本地没有同名歌单（共 ${total} 首），已记入待手动导入清单`);
            try {
              await ctx.ui.toast({
                level: "warning",
                message: `有 ${newPending.length} 个歌单在澜音里还没有同名歌单（共 ${total} 首）。点插件里的「立即同步」会弹出新建歌单，确认后即可导入。`
              });
            } catch {
            }
          }
          if (!cancelled) {
            await ctx.storage.set(REMOTE_HASH_KEY, fetched2.hash);
            await ctx.storage.set(LOCAL_HASH_KEY, await computeLocalHash(operation));
            const nextView = {};
            const localNamesForView = new Set((await listLocalPlaylists(operation)).map((p) => p.name));
            for (const pl of merged2) {
              const n = str(pl.name);
              if (!n || !localNamesForView.has(n)) continue;
              nextView[n] = (Array.isArray(pl.tracks) ? pl.tracks : []).map(hubTrackKey).filter(Boolean).sort();
            }
            await ctx.storage.set(LAST_VIEW_KEY, nextView);
          }
          lastSyncAt = now;
          lastSyncCommitted = !cancelled;
          status = buildStatusText(summary, cleanCount, noTargetSkipped, deleteSkipReason, deleteFailed);
          log("info", status);
          await updateState();
          return summary;
        } finally {
          await progress.close();
        }
      } finally {
        busy = false;
        if (config && config.autoSync) await syncAutoTimer(true);
      }
    }
    function buildStatusText(summary, cleanCount, noTargetSkipped, deleteSkipReason, deleteFailed) {
      const parts = [`导入 ${summary.imported} 首`];
      if (summary.deletedPlaylists)
        parts.push(`本地 ${summary.deletedPlaylists} 个歌单已在其他设备删除（请在澜音里手动删掉同名歌单）`);
      if (summary.skipped) parts.push(`跳过重复 ${summary.skipped} 首`);
      if (summary.unwritable) parts.push(`${summary.unwritable} 首非平台歌曲未同步`);
      if (noTargetSkipped) parts.push(`${noTargetSkipped} 首因本地无同名歌单待手动同步`);
      if (summary.autoDeleted) parts.push(`自动删除 ${summary.autoDeleted} 首`);
      if (summary.withheld)
        parts.push(`${summary.withheld} 首已在其他设备删除（本地删不掉，已不再回写）`);
      if (cleanCount)
        parts.push(
          deleteSkipReason === "host-too-old" ? `${cleanCount} 首跳过删除（澜音版本过低，请升级 2.2.1+ 后再同步）` : deleteSkipReason === "no-api" ? `${cleanCount} 首跳过删除（当前澜音未开放删除接口，请升级澜音）` : deleteSkipReason === "not-granted" ? `${cleanCount} 首跳过删除（未授权删除，请在插件设置里重新授权）` : `${cleanCount} 首跳过删除（原因未知，请查看日志）`
        );
      if (deleteFailed) parts.push(`${deleteFailed} 首删除未匹配到本地曲目（请上报，已跳过；不会写回云端）`);
      if (summary.cancelled) parts.push("导入被取消");
      return "同步完成：" + parts.join("，");
    }
    async function createProgress(title) {
      let id;
      try {
        id = (await ctx.ui.progress.create({ title, cancellable: false })).id;
      } catch {
        id = void 0;
      }
      return {
        async update(message) {
          if (!id) return;
          try {
            await ctx.ui.progress.update(id, { message });
          } catch {
            id = void 0;
          }
        },
        async close() {
          if (!id) return;
          try {
            await ctx.ui.progress.close(id);
          } catch {
          }
          id = void 0;
        }
      };
    }
    function formatLocalTime(value) {
      const time = Date.parse(str(value));
      if (!Number.isFinite(time)) return "";
      const d = new Date(time);
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    function lastSyncText() {
      const interval = config && config.autoSync ? `每 ${config && config.syncInterval || 3} 分钟自动检测` : "自动同步已关闭";
      if (!lastSyncAt) return `上次同步：尚未同步过 · ${interval}`;
      const abs = formatLocalTime(lastSyncAt);
      if (!abs) return `上次同步：未知 · ${interval}`;
      return `上次同步：${abs}${lastSyncCommitted ? "" : "（未完成）"} · ${interval}`;
    }
    function pendingText() {
      const names = Object.keys(pendingImports);
      if (!names.length) return "";
      const total = names.reduce((n, name) => n + (pendingImports[name] || 0), 0);
      const shown = names.length <= 2 ? names.join("、") : `${names.slice(0, 2).join("、")} 等 ${names.length} 个`;
      return `待手动导入：${shown}（共 ${total} 首）· 点「立即同步」会弹出新建歌单窗口`;
    }
    function publicState() {
      return {
        serverUrl: config ? config.serverUrl : "",
        username: config ? config.username : "",
        passwordStatus: config && config.password ? "密码已保存" : "密码未保存",
        autoSync: config ? config.autoSync : false,
        syncInterval: config ? config.syncInterval || 3 : 3,
        remember: config ? config.remember : true,
        deviceName: config ? config.deviceName || "" : "",
        connected: !!config,
        lastSyncText: lastSyncText(),
        pendingText: pendingText(),
        status
      };
    }
    async function updateState() {
      await ctx.ui.setState("settings", publicState());
    }
    async function saveConnection(input, operation) {
      const serverUrl = normalizeServer(input && input.serverUrl);
      const username = str(input && input.username);
      if (!username) throw fault("INVALID_INPUT", "请输入用户名");
      const password = str(input && input.password);
      if (!password && (!config || config.serverUrl !== serverUrl || config.username !== username))
        throw fault("INVALID_INPUT", "请输入密码");
      const rawInterval = input ? input.syncInterval : void 0;
      const intervalMissing = rawInterval === void 0 || rawInterval === null || rawInterval === "";
      const syncInterval = intervalMissing && config && config.syncInterval ? config.syncInterval : parseMinutes(rawInterval);
      const rawDevice = input ? input.deviceName : void 0;
      const deviceMissing = rawDevice === void 0 || rawDevice === null || rawDevice === "";
      const deviceName = deviceMissing ? config && config.deviceName || savedDeviceName || DEFAULT_DEVICE_NAME : str(rawDevice).trim();
      if (!deviceMissing && !DEVICE_NAME_RE.test(deviceName))
        throw fault("INVALID_INPUT", "设备名只能用字母、数字、-、_（最长 32 位），请修改后再保存");
      const candidate = {
        serverUrl,
        username,
        password: password || config && config.password || "",
        autoSync: input && input.autoSync === true,
        syncInterval,
        remember: input && input.remember === true,
        deviceName
      };
      const previous = config;
      config = candidate;
      log(
        "info",
        `保存配置：表单 syncInterval=${JSON.stringify(rawInterval)} → 生效 ${syncInterval} 分钟` + (intervalMissing ? "（表单未提交该字段，沿用上次的值）" : "")
      );
      if (busy) {
        for (let i = 0; i < 30 && busy; i++) await sleepSafe(1e3);
        if (busy) {
          config = previous;
          throw fault("INVALID_INPUT", "同步正在进行，请稍候再保存");
        }
      }
      busy = true;
      try {
        const fetched = await fetchRemote(operation);
        const count = (fetched.payload.playlists || []).length;
        status = count ? `连接正常，同步服务里有 ${count} 个歌单` : "连接正常，同步服务里还没有歌单";
        const toast = count ? `配置已保存，同步服务连接正常（${count} 个歌单）` : status;
        if (candidate.remember) await ctx.storage.set(STORAGE_KEY, candidate);
        else await ctx.storage.delete(STORAGE_KEY);
        savedDeviceName = deviceName;
        await ctx.storage.set(DEVICE_KEY, { deviceName });
        await syncAutoTimer();
        await updateState();
        await ctx.ui.toast({ level: "success", message: toast });
        return { connected: true, serverUrl, playlists: count };
      } catch (error) {
        config = previous;
        log("error", `保存配置/连接失败：${error && error.message ? error.message : "未知错误"}`, {
          code: error && error.code
        });
        throw error;
      } finally {
        busy = false;
        await syncAutoTimer(true);
      }
    }
    function register(id, handler) {
      ctx.effects.add(ctx.actions.register(id, handler));
    }
    register("settings.open", () => ctx.ui.openView("settings"));
    register("settings.save", (input, operation) => {
      if (input && input.mode === "state") return publicState();
      if (input && input.mode === "save") return saveConnection(input, operation);
      if (input && input.mode === "disconnect") return disconnect();
      return ctx.ui.openView("settings");
    });
    register("sync.run", async (_input, operation) => {
      if (busy) {
        for (let i = 0; i < 30 && busy; i++) await sleepSafe(1e3);
        if (busy) throw fault("INVALID_INPUT", "自动同步正在进行，请稍后再试");
      }
      status = "正在同步…";
      await updateState();
      let summary;
      try {
        summary = await doSync(operation, {});
      } catch (error) {
        status = "同步失败：" + (error && error.message ? error.message : "未知错误");
        log("error", `同步失败：${error && error.message ? error.message : "未知错误"}`, {
          code: error && error.code
        });
        await updateState();
        throw error;
      }
      await ctx.ui.toast({ level: "success", message: status });
      return summary;
    });
    register("sync.check", async (_input, operation) => {
      if (!config) return { unchanged: true, playlists: 0, imported: 0, skipped: 0 };
      if (busy) return { unchanged: true, playlists: 0, imported: 0, skipped: 0 };
      return doSync(operation, { checkChange: true, auto: true });
    });
    async function runOnLibraryChanged() {
      if (!config || busy) return;
      const op = lastOperationRef || {
        id: "webdav-sync:evt:" + Date.now(),
        deadlineAt: Date.now() + 12e4,
        signal: void 0
      };
      try {
        await doSync(op, { checkChange: true, auto: true });
      } catch {
      }
    }
    try {
      if (ctx.events && typeof ctx.events.on === "function") {
        ctx.effects.add(
          ctx.events.on(
            "library.changed",
            () => {
              void runOnLibraryChanged();
            },
            { permissionKey: READ_KEY }
          )
        );
      }
    } catch {
    }
    async function syncAutoTimer(silent) {
      try {
        if (config && config.autoSync) {
          const minutes = config && config.syncInterval || 3;
          await ctx.tasks.schedule(
            { id: AUTO_SYNC_TASK_ID, commandId: "sync.check", intervalMs: minutes * 6e4 },
            { permissionKey: BG_KEY }
          );
          if (!silent) status = `已开启自动同步（约每 ${minutes} 分钟检测歌单变化）`;
          log("info", `自动同步定时器已排期：每 ${minutes} 分钟检测一次`);
        } else {
          try {
            await ctx.tasks.cancel(AUTO_SYNC_TASK_ID, { permissionKey: BG_KEY });
            log("debug", "已取消自动同步定时任务");
          } catch {
          }
        }
        if (!silent) await updateState();
      } catch (error) {
        if (!silent) {
          status = "自动同步调度失败：" + (error && error.message ? error.message : "未知错误");
          await updateState();
        }
        log("warn", `自动同步定时器排期失败：${error && error.message ? error.message : "未知错误"}`);
      }
    }
    async function disconnect() {
      try {
        await ctx.tasks.cancel(AUTO_SYNC_TASK_ID, { permissionKey: BG_KEY });
        log("debug", "已取消自动同步定时任务");
      } catch {
      }
      await ctx.storage.delete(STORAGE_KEY);
      config = null;
      status = "已断开，配置已清除";
      log("info", "已断开连接并清除已保存的配置");
      await updateState();
      return { connected: false };
    }
    const savedPending = await ctx.storage.get(PENDING_KEY);
    if (asRecord(savedPending)) {
      for (const name of Object.keys(savedPending)) {
        const count = Number(savedPending[name]);
        if (name && Number.isFinite(count) && count > 0) pendingImports[name] = count;
      }
    }
    const savedLastSync = await ctx.storage.get(LAST_SYNC_KEY);
    if (savedLastSync && asRecord(savedLastSync) && savedLastSync.at) {
      lastSyncAt = str(savedLastSync.at);
      lastSyncCommitted = savedLastSync.committed !== false;
    }
    const saved = await ctx.storage.get(STORAGE_KEY);
    if (saved && asRecord(saved) && saved.remember === true) {
      try {
        config = {
          serverUrl: normalizeServer(saved.serverUrl),
          username: str(saved.username),
          password: str(saved.password),
          autoSync: saved.autoSync === true,
          syncInterval: parseMinutes(saved.syncInterval),
          remember: true,
          deviceName: str(saved.deviceName)
          // 恢复设备名（非法值由 deviceHeader 运行时兜底）
        };
        status = "已载入连接，等待同步";
      } catch {
        status = "已保存的配置无效，请重新设置";
        config = null;
      }
    }
    const savedDevice = await ctx.storage.get(DEVICE_KEY);
    if (savedDevice && asRecord(savedDevice)) savedDeviceName = str(savedDevice.deviceName);
    await updateState();
    void (async () => {
      try {
        const playlistsApi = ctx.library && ctx.library.playlists || {};
        let declared = [];
        try {
          const availability = await ctx.capabilities.get("library");
          declared = availability && availability.methods || [];
        } catch {
        }
        let deletePermission = "unknown";
        try {
          const perm = await ctx.permissions.query({ key: DELETE_KEY });
          deletePermission = perm && perm.status || "unknown";
        } catch {
        }
        log("info", "宿主歌单 API 诊断", {
          exposed: Object.keys(playlistsApi),
          declared,
          removeTracks: typeof playlistsApi.removeTracks,
          clearPlaylist: typeof playlistsApi.clearPlaylist,
          deletePermission
        });
      } catch {
      }
    })();
    if (config && config.autoSync) {
      await syncAutoTimer();
      try {
        await doSync(null, { checkChange: true, auto: true });
      } catch (error) {
        status = "启动同步失败：" + (error && error.message ? error.message : "未知错误");
        await updateState();
      }
    }
  });
  return __toCommonJS(index_exports);
})();

if (typeof __ceru_entry.default !== "function") throw new Error("Entry must default-export a function");
return __ceru_entry.default(ctx);
};

// Embedded static resources
const resources = {"schema.settings":{"type":"json","value":{"schemaVersion":"1.0","id":"settings","presentation":{"kind":"drawer","placement":"right","size":480,"openOnFirstUse":true},"root":{"type":"form","title":"音枢歌单同步","submitAction":"settings.save","submitInput":{"mode":"save"},"submitLabel":"保存并测试","children":[{"type":"text","bind":"status"},{"type":"text","bind":"lastSyncText"},{"type":"text","bind":"pendingText"},{"type":"text-input","bind":"serverUrl","label":"同步服务地址","placeholder":"http://127.0.0.1:8000","description":"填歌单同步枢纽的地址；手机栖弦、洛雪连的是同一个服务。","required":true},{"type":"text-input","bind":"username","label":"用户名","placeholder":"枢纽里的账号","required":true},{"type":"password","bind":"password","label":"密码","placeholder":"留空 = 沿用已保存的密码"},{"type":"text","bind":"passwordStatus"},{"type":"toggle","bind":"remember","label":"在本机记住配置","description":"保存地址与账号密码，下次免填。"},{"type":"toggle","bind":"autoSync","label":"自动同步","description":"歌单一有变化就自动同步（澜音、栖弦、洛雪任一端都算）。"},{"type":"number","bind":"syncInterval","label":"自动同步间隔（分钟）","placeholder":"3","description":"默认 3 分钟，可填 1~60；改完要点「保存」才生效。"},{"type":"text-input","bind":"deviceName","label":"设备名","placeholder":"ceru-music","description":"只有「同一账号 + 多台澜音」才需要填：给每台起不同名字，避免互相干扰。只有一台澜音或各自用不同账号，留空即可（默认 ceru-music）。"},{"type":"button","label":"立即同步","action":"sync.run","requires":"connected"},{"type":"button","label":"断开连接并清除配置","action":"settings.save","input":{"mode":"disconnect"},"requires":"connected"}]}}}};

// Public plugin exports

exports.activate = LogicMain;

exports.resources = resources;
