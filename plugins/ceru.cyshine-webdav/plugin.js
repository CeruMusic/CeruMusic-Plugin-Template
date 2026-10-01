exports.manifest = {
  manifestVersion: 2,
  id: "ceru.cyshine-webdav",
  name: "栖弦歌单同步",
  version: "0.2.6",
  description: "让手机栖弦与桌面澜音通过 WebDAV 双向同步歌单：澜音侧新增/删除会自动写回云端，栖弦侧的删除会在澜音列出待清理清单。",
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
      },
      {
        id: "deletions",
        kind: "native",
        title: "待清理歌单",
        entry: "deletions.view"
      }
    ]
  },
  contributes: {
    commands: [
      {
        id: "settings",
        title: "连接 WebDAV",
        action: "settings.open",
        view: "settings"
      },
      {
        id: "settings.save",
        title: "保存 WebDAV 配置",
        action: "settings.save"
      },
      {
        id: "sync",
        title: "同步栖弦歌单",
        action: "sync.run"
      },
      {
        id: "sync.check",
        title: "自动检测并同步",
        action: "sync.check"
      },
      {
        id: "deletions.open-view",
        title: "查看待清理清单",
        action: "deletions.open-view",
        view: "deletions"
      },
      {
        id: "deletions.view",
        title: "渲染待清理清单",
        action: "deletions.view"
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
      key: "cyshine.http",
      name: "network.request",
      reason: "访问你设置的 WebDAV/AList 服务器，读取栖弦歌单"
    },
    {
      key: "cyshine.lan",
      name: "network.private",
      optional: true,
      reason: "连接本机或局域网内的 AList 服务器"
    },
    {
      key: "cyshine.write",
      name: "library.write",
      reason: "把栖弦歌单导入澜音本地歌单"
    },
    {
      key: "cyshine.read",
      name: "library.read",
      reason: "读取澜音本地歌单，按同名匹配栖弦歌单导入，避免合并"
    },
    {
      key: "cyshine.background",
      name: "background.run",
      optional: true,
      reason: "开启「自动同步」时，定时检测 WebDAV 歌单变化并在后台自动同步"
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

  // node_modules/@shiqianjiang/ceru-plugin-sdk/dist/music.js
  var record = (value) => !!value && typeof value === "object" && !Array.isArray(value);
  var text = (value, max = 4096) => typeof value === "string" && value.length <= max;
  var milliseconds = (value) => Number.isFinite(value) && Number(value) >= 0;
  function assertResourceRef(value) {
    if (!record(value) || !["providerId", "kind", "id"].every((key) => text(value[key], 2048) && value[key].length > 0) || value.pluginId !== void 0 && (!text(value.pluginId, 2048) || !value.pluginId))
      throw new Error("Invalid resource reference");
    if (value.connectionId !== void 0 && (!text(value.connectionId, 2048) || !value.connectionId))
      throw new Error("Invalid resource connection");
    if (value.scope !== void 0 && (value.scope !== "provider" || value.kind !== "track" || value.connectionId !== void 0))
      throw new Error("Provider scope requires a public track without a connection");
    if (value.pluginId === void 0 && value.scope !== "provider")
      throw new Error("Private resources require an owning plugin");
    if (value.data !== void 0) {
      if (!record(value.data))
        throw new Error("Invalid resource private data");
      let encoded;
      try {
        encoded = JSON.stringify(value.data);
      } catch {
        throw new Error("Resource private data must be JSON");
      }
      if (new TextEncoder().encode(encoded).byteLength > 64 * 1024)
        throw new Error("Resource private data exceeds 64 KiB");
    }
  }
  function assertContentPage(value) {
    if (!record(value) || !Array.isArray(value.items) || value.items.length > 1e4)
      throw new Error("Invalid content page");
    if (value.nextCursor != null && (!text(value.nextCursor, 2048) || !value.nextCursor.length))
      throw new Error("Invalid pagination cursor");
    for (const item of value.items) {
      if (!record(item) || !text(item.title) || !Array.isArray(item.capabilities) || !item.capabilities.every((entry) => text(entry, 128)))
        throw new Error("Invalid content item");
      assertResourceRef(item.ref);
      if (item.ref.kind === "track") {
        if (!record(item.metadata) || !Array.isArray(item.metadata.artists) || !item.metadata.artists.every((artist) => text(artist)))
          throw new Error("Track metadata must contain artists");
        if (item.metadata.durationMs !== void 0 && !milliseconds(item.metadata.durationMs))
          throw new Error("Invalid track duration");
        const { qualities, qualitySizes, qualitySizeLabels, hash } = item.metadata;
        if (hash !== void 0 && !text(hash, 4096))
          throw new Error("Invalid track hash");
        if (qualitySizeLabels !== void 0 && (!record(qualitySizeLabels) || Object.keys(qualitySizeLabels).length > 128 || Object.entries(qualitySizeLabels).some(([quality, label]) => !qualities?.includes(quality) || !text(label, 128))))
          throw new Error("Invalid track quality size labels");
        if (qualities !== void 0 && (!Array.isArray(qualities) || qualities.length > 128 || !qualities.every((quality) => text(quality, 128) && !!quality)))
          throw new Error("Invalid track qualities");
        if (qualitySizes !== void 0 && (!record(qualitySizes) || Object.keys(qualitySizes).length > 128 || Object.entries(qualitySizes).some(([quality, bytes]) => !qualities?.includes(quality) || !Number.isSafeInteger(bytes) || Number(bytes) <= 0)))
          throw new Error("Invalid track quality sizes");
      }
      if (item.ref.kind === "playlist" && item.playlist !== void 0) {
        if (!record(item.playlist))
          throw new Error("Invalid playlist metadata");
        if (item.playlist.trackCount !== void 0 && (!Number.isInteger(item.playlist.trackCount) || item.playlist.trackCount < 0))
          throw new Error("Invalid playlist track count");
      }
      if (item.ref.kind === "chart" && item.chart !== void 0 && !record(item.chart))
        throw new Error("Invalid chart metadata");
    }
  }

  // node_modules/@shiqianjiang/ceru-plugin-sdk/dist/native-view.js
  function defineNativeView(render) {
    return async (input, operation) => {
      const value = await render(input, operation);
      assertNativeView(value);
      return value;
    };
  }
  function assertJson(value, ancestors = /* @__PURE__ */ new Set()) {
    if (value === null || typeof value === "string" || typeof value === "boolean")
      return;
    if (typeof value === "number" && Number.isFinite(value))
      return;
    if (!value || typeof value !== "object" || ancestors.has(value))
      throw new Error("Native view must contain JSON data only");
    if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
      throw new Error("Native view must contain JSON data only");
    ancestors.add(value);
    for (const item of Object.values(value))
      if (item !== void 0)
        assertJson(item, ancestors);
    ancestors.delete(value);
  }
  function assertNativeView(value, actions) {
    assertJson(value);
    const v = value;
    const text2 = (s, max = 500) => typeof s === "string" && s.length <= max;
    const action = (s) => text2(s, 128) && !!s && (!actions || actions.has(s));
    if (!v || v.type !== "page" || !Array.isArray(v.sections) || v.sections.length > 24 || v.title !== void 0 && !text2(v.title) || v.description !== void 0 && !text2(v.description, 4e3))
      throw new Error("Invalid native view");
    const validateActions = (items) => {
      if (items !== void 0 && (!Array.isArray(items) || items.length > 16))
        throw new Error("Invalid native actions");
      for (const item of items ?? [])
        if (!item || !text2(item.label, 100) || !item.label || !action(item.action) || item.primary !== void 0 && typeof item.primary !== "boolean" || JSON.stringify(item.input ?? {}).length > 16384)
          throw new Error("Invalid native action");
    };
    validateActions(v.actions);
    const ids = /* @__PURE__ */ new Set();
    for (const section of v.sections) {
      if (!section || !text2(section.id, 128) || !section.id || ids.has(section.id) || !["grid", "list"].includes(section.layout) || section.title !== void 0 && !text2(section.title) || section.onOpen !== void 0 && !action(section.onOpen) || section.onPlay !== void 0 && !action(section.onPlay))
        throw new Error("Invalid native section");
      ids.add(section.id);
      validateActions(section.itemActions);
      assertContentPage({ items: section.items });
    }
  }

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
  var SCHEMA_VERSION = 1;
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
    const text2 = JSON.stringify(canonicalize(value));
    if (cryptoMod && typeof cryptoMod.createHash === "function") {
      try {
        const h = cryptoMod.createHash("sha256");
        h.update(text2);
        const digest = h.digest("hex");
        if (typeof digest === "string" && digest) return digest;
      } catch {
      }
    }
    let a = 2166136261;
    let b = 3421674724;
    for (let i = 0; i < text2.length; i++) {
      const c = text2.charCodeAt(i);
      a = Math.imul(a ^ c, 16777619) >>> 0;
      b = Math.imul(b ^ (c ^ 93), 16777619) >>> 0;
    }
    return a.toString(16).padStart(8, "0") + b.toString(16).padStart(8, "0");
  }
  function base64Encode(input) {
    const text2 = String(input);
    const bytes = [];
    for (let i = 0; i < text2.length; i++) {
      const code = text2.codePointAt(i);
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
  function durationMs(interval) {
    const t = str(interval);
    if (!t) return void 0;
    const parts = t.split(":");
    if (parts.length > 3 || parts.some((p) => !/^\d+(\.\d+)?$/.test(p.trim()))) return void 0;
    const seconds = parts.reduce((total, part) => total * 60 + Number(part), 0);
    return Number.isFinite(seconds) ? Math.round(seconds * 1e3) : void 0;
  }
  function msToInterval(ms) {
    if (!ms || !Number.isFinite(ms) || ms < 0) return void 0;
    const total = Math.floor(ms / 1e3);
    const m = Math.floor(total / 60);
    return `${String(m).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }
  function collectQualities(meta) {
    const found = [];
    const push = (type) => {
      const name = str(type);
      if (name && !found.includes(name)) found.push(name);
    };
    const walk = (value) => {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === "string") push(item);
          else {
            const e = asRecord(item);
            if (e) push(e.type);
          }
        }
      } else if (asRecord(value)) {
        for (const type of Object.keys(value)) push(type);
      }
    };
    walk(meta && (meta.qualitys ?? meta._qualitys));
    return found;
  }
  var KEY_SEP = "\0";
  function trackKey(source, songId) {
    const s = str(source);
    const id = str(songId);
    if (!s || !id) return "";
    return s + KEY_SEP + id;
  }
  function remoteTrackSource(track) {
    const record2 = asRecord(track);
    if (!record2) return "";
    const musicInfo = asRecord(record2.musicInfo) || {};
    const meta = asRecord(musicInfo.meta) || {};
    return str(record2.source) || str(meta.source) || str(musicInfo.source);
  }
  function remoteTrackSongId(track) {
    const record2 = asRecord(track);
    if (!record2) return "";
    const meta = asRecord(asRecord(record2.musicInfo)?.meta);
    const songId = str(meta && meta.songId);
    if (songId) return songId;
    const musicId = str(record2.musicId);
    const source = remoteTrackSource(track);
    if (musicId && source && musicId.startsWith(source + "_")) return musicId.slice(source.length + 1);
    return musicId;
  }
  function remoteTrackKey(track) {
    return trackKey(remoteTrackSource(track), remoteTrackSongId(track));
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
  var MAX_TITLE = 4096;
  var MAX_ID = 2048;
  var MAX_QUALITY = 128;
  var MAX_QUALITIES = 128;
  function clampText(value, max) {
    const text2 = str(value);
    return text2.length > max ? text2.slice(0, max) : text2;
  }
  function safeQualities(meta) {
    return collectQualities(meta).filter((q) => typeof q === "string" && q.length > 0 && q.length <= MAX_QUALITY).slice(0, MAX_QUALITIES);
  }
  function trackToItem(track, pluginId) {
    const record2 = asRecord(track);
    if (!record2) return null;
    const musicInfo = asRecord(record2.musicInfo) || {};
    const meta = asRecord(musicInfo.meta) || {};
    const source = remoteTrackSource(track);
    if (!source || source.length > MAX_ID) return null;
    const id = remoteTrackSongId(track);
    if (!id || id.length > MAX_ID) return null;
    const title = clampText(record2.name, MAX_TITLE) || id;
    const singer = str(record2.singer) || str(meta.singer);
    const albumName = str(meta.albumName) || str(record2.albumName);
    const artworkUrl = str(meta.picUrl) || str(record2.picUrl);
    const interval = str(musicInfo.interval) || str(record2.interval);
    const qualities = safeQualities(meta);
    const duration = durationMs(interval);
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
        ...albumName ? { album: { title: clampText(albumName, MAX_TITLE) } } : {},
        ...qualities.length ? { qualities } : {},
        ...artworkUrl ? { artworkUrl } : {},
        ...duration === void 0 ? {} : { durationMs: duration }
      }
    };
  }
  function itemToRemoteTrack(item) {
    if (!isWritableLocalItem(item)) return null;
    const ref = asRecord(item.ref);
    const source = str(ref.providerId);
    const songId = str(ref.id);
    const metadata = asRecord(item.metadata) || {};
    const name = str(item.title) || songId;
    const singer = (Array.isArray(metadata.artists) ? metadata.artists : []).map((a) => str(a)).filter(Boolean).join("、");
    const albumName = str(asRecord(metadata.album) && asRecord(metadata.album).title);
    const qualities = Array.isArray(metadata.qualities) ? metadata.qualities : [];
    const ranked = QUALITY_RANK.filter((q) => qualities.includes(q));
    const quality = ranked[0] || "";
    const picUrl = str(metadata.artworkUrl);
    const interval = msToInterval(metadata.durationMs);
    const musicId = `${source}_${songId}`;
    const meta = {
      songId,
      ...albumName ? { albumName } : {},
      ...picUrl ? { picUrl } : {},
      qualitys: ranked.map((t) => ({ type: t })),
      _qualitys: Object.fromEntries(ranked.map((t) => [t, {}]))
    };
    return {
      musicId,
      name,
      singer,
      albumName,
      source,
      quality,
      picUrl,
      musicInfo: { id: musicId, name, singer, source, ...interval ? { interval } : {}, meta }
    };
  }
  function parsePlaylists(snapshot) {
    if (!asRecord(snapshot)) throw new Error("sync-v1.json 内容无效");
    const sections = asRecord(snapshot.sections);
    const playlists = sections && sections.playlists;
    if (!asRecord(playlists)) throw new Error("sync-v1.json 缺少 sections.playlists");
    const data = playlists.data;
    if (!Array.isArray(data)) return [];
    return data.map(asRecord).filter(Boolean);
  }
  function newPlaylistEntry(name, tracks, now) {
    return {
      version: 1,
      id: "cyshine-" + contentHash(name),
      name,
      tracks,
      createdAt: now,
      updatedAt: now
    };
  }
  function initialAppearanceSection() {
    return {
      modifiedAt: "1970-01-01T00:00:00.000Z",
      data: {
        themeMode: "system",
        themeSeedArgb: 4280391411,
        // 0xFF2196F3 栖弦默认蓝（必须是 JSON 整数，浮点会被拒）
        colorStyle: "soft",
        useDynamicColor: false,
        flowingLightEnabled: true
      }
    };
  }
  function initialMusicSourcesSection() {
    return {
      modifiedAt: "1970-01-01T00:00:00.000Z",
      data: { records: [], enabledIds: [], scripts: {} }
    };
  }
  function buildSnapshot(playlistsData, now) {
    return {
      schemaVersion: SCHEMA_VERSION,
      generatedAt: now,
      sections: {
        playlists: { modifiedAt: now, data: playlistsData },
        // appearance / musicSources 用过去时间戳：
        // 栖弦本地配置（时间戳较新）会胜出，不覆盖用户主题/音源；结构合法则即使胜出也不会报错
        appearance: initialAppearanceSection(),
        musicSources: initialMusicSourcesSection()
      }
    };
  }
  function planPlaylistSync({ remoteTracks, localItems, lastKeys, tombstones, now }) {
    const remoteByKey = /* @__PURE__ */ new Map();
    for (const track of remoteTracks || []) {
      const key = remoteTrackKey(track);
      if (key && !remoteByKey.has(key)) remoteByKey.set(key, track);
    }
    const localByKey = /* @__PURE__ */ new Map();
    for (const item of localItems || []) {
      const key = localItemKey(item);
      if (key && !localByKey.has(key)) localByKey.set(key, item);
    }
    const remoteKeys = new Set(remoteByKey.keys());
    const localKeys = new Set(localByKey.keys());
    const lastSet = new Set((lastKeys || []).filter(Boolean));
    const table = {};
    for (const key of Object.keys(asRecord(tombstones) || {})) {
      const entry = asRecord(tombstones[key]);
      if (entry) table[key] = { by: entry.by, at: entry.at };
    }
    const importItems = [];
    const importKeys = [];
    const writeAddedItems = [];
    const writeRemovedKeys = [];
    const cleanSongs = [];
    let unwritable = 0;
    for (const key of /* @__PURE__ */ new Set([...remoteKeys, ...localKeys, ...lastSet])) {
      const inRemote = remoteKeys.has(key);
      const inLocal = localKeys.has(key);
      const inLast = lastSet.has(key);
      const tomb = table[key];
      if (!inRemote && !inLocal) {
        if (tomb) delete table[key];
        continue;
      }
      if (inRemote && inLocal) {
        if (tomb) delete table[key];
        continue;
      }
      if (inLocal) {
        const item = localByKey.get(key);
        const asClean = () => {
          cleanSongs.push({
            id: item && item.ref && String(item.ref.id) || key,
            title: item && item.title || "",
            artworkUrl: item && item.metadata && item.metadata.artworkUrl || ""
          });
        };
        if (tomb && tomb.by === "remote") {
          asClean();
        } else if (inLast) {
          table[key] = { by: "remote", at: now };
          asClean();
        } else if (isWritableLocalItem(item)) {
          writeAddedItems.push(item);
        } else {
          unwritable++;
        }
        continue;
      }
      if (tomb && tomb.by === "local") {
        writeRemovedKeys.push(key);
      } else if (inLast) {
        table[key] = { by: "local", at: now };
        writeRemovedKeys.push(key);
      } else {
        const track = remoteByKey.get(key);
        if (track) {
          importItems.push(track);
          importKeys.push(key);
        }
      }
    }
    const remoteKeysAfter = new Set(remoteKeys);
    for (const key of writeRemovedKeys) remoteKeysAfter.delete(key);
    for (const item of writeAddedItems) remoteKeysAfter.add(localItemKey(item));
    return {
      importItems,
      importKeys,
      writeAddedItems,
      writeRemovedKeys,
      cleanSongs,
      remoteKeys,
      localKeys,
      remoteKeysAfter,
      tombstones: table,
      unwritable
    };
  }
  function appliedBaseline({ localKeys, importKeys, remoteKeysAfter }) {
    const local = /* @__PURE__ */ new Set([...localKeys || [], ...importKeys || []]);
    const out = [];
    for (const key of local) if (remoteKeysAfter.has(key)) out.push(key);
    return out.sort();
  }
  function reconcilePlaylists({ lastSnap, remoteNames, localNames, remoteDeletedTomb, now }) {
    const remote = new Set(remoteNames || []);
    const local = new Set(localNames || []);
    const snapshot = asRecord(lastSnap) || {};
    const tombstones = {};
    for (const name of Object.keys(asRecord(remoteDeletedTomb) || {})) {
      const entry = asRecord(remoteDeletedTomb[name]);
      if (entry) tombstones[name] = { at: entry.at, reason: entry.reason || "remote-deleted" };
    }
    const droppedFromBaseline = [];
    const remoteDeleted = [];
    for (const name of Object.keys(snapshot)) {
      if (remote.has(name)) continue;
      droppedFromBaseline.push(name);
      if (local.has(name)) {
        tombstones[name] = { at: now, reason: "remote-deleted" };
        remoteDeleted.push(name);
      }
    }
    for (const name of Object.keys(tombstones)) {
      if (remote.has(name) || !local.has(name)) delete tombstones[name];
    }
    const pushCandidates = [];
    for (const name of local) {
      if (remote.has(name)) continue;
      if (tombstones[name]) continue;
      pushCandidates.push(name);
    }
    return { droppedFromBaseline, remoteDeleted, pushCandidates, tombstones };
  }

  // src/index.js
  var LOG_PREFIX = "[栖弦歌单同步]";
  var STORAGE_KEY = "connection.v1";
  var AUTO_SYNC_TASK_ID = "cyshine.auto-sync";
  var LAST_HASH_KEY = "last-hash.v2";
  var LOCAL_HASH_KEY = "local-hash.v2";
  var BASELINE_KEY = "playlist-ids.v2";
  var TOMBSTONE_KEY = "deleted-tombstones.v2";
  var PLAYLIST_TOMBSTONE_KEY = "deleted-remote-playlists.v2";
  var CAS_SUPPORT_KEY = "cas-support.v2";
  var MOVE_SUPPORT_KEY = "atomic-write.v1";
  var DELETIONS_KEY = "deletions.v1";
  var LAST_SYNC_KEY = "last-sync.v1";
  var PENDING_KEY = "pending-imports.v1";
  var TOMBSTONE_MAX_AGE_MS = 180 * 24 * 3600 * 1e3;
  var TOMBSTONE_MAX_PER_PLAYLIST = 5e3;
  var SYNC_DIR_NAME = "CyShineMusic";
  var SYNC_FILE_NAME = "sync-v1.json";
  var PROBE_FILE_NAME = "__ceru_probe__.json";
  var MOVE_PROBE_FROM = "__ceru_probe_move.json";
  var MOVE_PROBE_TO = "__ceru_probe_move2.json";
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
    let lastFetchMeta = null;
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
      if (!raw) throw fault("INVALID_INPUT", "请输入 WebDAV 地址");
      if (!raw.includes("://")) raw = "https://" + raw;
      let url;
      try {
        url = new URL(raw);
      } catch {
        throw fault("INVALID_INPUT", "WebDAV 地址无效，请输入完整 http(s) 地址");
      }
      if (!["http:", "https:"].includes(url.protocol))
        throw fault("INVALID_INPUT", "WebDAV 地址只支持 HTTP(S)");
      if (url.username || url.password)
        throw fault("INVALID_INPUT", "请把账号密码填到下方字段，不要放进地址里");
      return url.origin + url.pathname.replace(/\/+$/, "");
    }
    function syncDirUrl() {
      const base = config.serverUrl.replace(/\/+$/, "");
      if (new RegExp("/" + SYNC_DIR_NAME + "/?$", "i").test(base)) return base;
      return base + "/" + SYNC_DIR_NAME;
    }
    function snapshotUrl() {
      return syncDirUrl() + "/" + SYNC_FILE_NAME;
    }
    function authHeader() {
      return "Basic " + base64Encode(config.username + ":" + config.password);
    }
    async function authorizeHttp(operation) {
      let result = await ctx.permissions.query({ key: "cyshine.http" });
      if (result.status === "prompt")
        result = await ctx.permissions.request({
          key: "cyshine.http",
          intent: operation && operation.userIntent
        });
      if (result.status !== "granted") {
        log("error", "网络权限未授予，无法访问 WebDAV", { status: result && result.status });
        throw fault("PERMISSION_DENIED", "请在插件权限中允许访问网络");
      }
    }
    async function request(method, url, { body, headers, timeoutMs, operation } = {}) {
      try {
        return await rawRequest(method, url, { body, headers, timeoutMs, operation });
      } catch (error) {
        if (error && error.code === "CANCELLED") throw error;
        if (!isLanPermissionError(error)) throw error;
        let status2 = (await ctx.permissions.query({ key: "cyshine.lan" })).status;
        if (status2 === "prompt" || status2 === "undeclared")
          status2 = (await ctx.permissions.request({
            key: "cyshine.lan",
            intent: operation && operation.userIntent
          })).status;
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
        permissionKey: "cyshine.http",
        url,
        method,
        headers: { Authorization: authHeader(), ...headers || {} },
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
    async function fetchSnapshot(operation) {
      await authorizeHttp(operation);
      log("debug", "读取云端：GET " + snapshotUrl());
      let response;
      try {
        response = await request("GET", snapshotUrl(), { operation });
      } catch (error) {
        if (error && error.code === "CANCELLED") throw error;
        throw fault("NETWORK_ERROR", "无法连接 WebDAV，请检查地址、网络与权限");
      }
      const { status: code, headers } = response;
      if (code === 401 || code === 403)
        throw fault("AUTH_REQUIRED", "WebDAV 用户名或密码不正确，请检查");
      if (code === 404)
        throw fault(
          "NOT_FOUND",
          "没有找到 sync-v1.json，请确认手机栖弦已配置同一地址并至少同步过一次"
        );
      if (code < 200 || code >= 300) throw fault("NETWORK_ERROR", "WebDAV 返回 HTTP " + code);
      lastFetchMeta = { etag: headers.etag || "", lastModified: headers["last-modified"] || "" };
      let body = response.body;
      if (typeof body === "string") {
        if (!body.trim()) throw fault("NETWORK_ERROR", "sync-v1.json 是空文件");
        try {
          const parsed = JSON.parse(body);
          log("debug", `读取云端成功（HTTP ${code}，${body.length} 字符）`);
          return parsed;
        } catch {
          throw fault("NETWORK_ERROR", "sync-v1.json 不是有效的 JSON");
        }
      }
      if (!body) throw fault("NETWORK_ERROR", "sync-v1.json 没有内容");
      log("debug", `读取云端成功（HTTP ${code}，已自动解析为对象）`);
      return body;
    }
    async function tryFetchSnapshot(operation) {
      try {
        return await fetchSnapshot(operation);
      } catch (error) {
        if (error && error.code === "NOT_FOUND") return null;
        throw error;
      }
    }
    async function putBody(url, body, headers, operation, label) {
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        let response;
        try {
          response = await request("PUT", url, {
            body,
            headers,
            timeoutMs: 6e4,
            // 宿主上限就是 60s，写更大的值会被静默夹掉
            operation
          });
        } catch (error) {
          if (error && error.code === "CANCELLED") throw error;
          if (attempt < maxAttempts) {
            await sleepSafe(1500 * attempt);
            continue;
          }
          throw fault("NETWORK_ERROR", `${label}失败，请检查地址、网络与权限（已重试 3 次）`);
        }
        const code = response.status;
        if (code === 412) return { conflicted: true };
        if (code >= 200 && code < 300) return { conflicted: false, status: code };
        if (code === 401 || code === 403) throw fault("AUTH_REQUIRED", "WebDAV 用户名或密码不正确");
        if (attempt < maxAttempts) {
          await sleepSafe(1500 * attempt);
          continue;
        }
        throw fault("NETWORK_ERROR", `${label}失败（HTTP ${code}，已重试 3 次）`);
      }
      return { conflicted: false };
    }
    async function writeSnapshot(snapshot, operation, options) {
      await authorizeHttp(operation);
      const body = JSON.stringify(snapshot);
      if (await canWriteAtomically()) return writeSnapshotAtomically(snapshot, body, operation);
      const ifMatch = options && options.ifMatch;
      const headers = {
        "Content-Type": "application/json",
        ...ifMatch ? { "If-Match": ifMatch } : {}
      };
      log(
        "debug",
        `写入云端：PUT ${snapshotUrl()}（${body.length} 字符${ifMatch ? "，If-Match 条件写" : ""}）`
      );
      const result = await putBody(snapshotUrl(), body, headers, operation, "写入 WebDAV");
      if (result.conflicted) return result;
      log("debug", `写入云端成功（HTTP ${result.status}）`);
      await assertRemoteMatches(snapshot, body, snapshotUrl(), operation, true);
      return { conflicted: false };
    }
    async function writeSnapshotAtomically(snapshot, body, operation) {
      const target = snapshotUrl();
      const tmp = target + ".tmp";
      log("debug", `原子写：PUT 临时文件（${body.length} 字符）→ 回读校验 → MOVE 覆盖正式文件`);
      try {
        const put = await putBody(
          tmp,
          body,
          { "Content-Type": "application/json" },
          operation,
          "写入临时文件"
        );
        if (put.conflicted) return put;
        await assertRemoteMatches(snapshot, body, tmp, operation, false);
        const moved = await request("MOVE", tmp, {
          headers: { Destination: target, Overwrite: "T" },
          timeoutMs: 3e4,
          operation
        });
        if (moved.status < 200 || moved.status >= 300)
          throw fault(
            "NETWORK_ERROR",
            `临时文件校验通过，但替换正式文件失败（MOVE 返回 HTTP ${moved.status}）；云端仍是上一次的完整内容，栖弦不受影响，可直接重试`
          );
        lastFetchMeta = null;
        log("info", "原子写完成：临时文件校验通过并已替换正式文件");
        return { conflicted: false };
      } catch (error) {
        try {
          await request("DELETE", tmp, { timeoutMs: 15e3, operation });
        } catch {
        }
        throw error;
      }
    }
    async function canWriteAtomically() {
      if (!config || config.verifyWrite === false) return false;
      return await ctx.storage.get(MOVE_SUPPORT_KEY) === "supported";
    }
    async function assertRemoteMatches(snapshot, expectedBody, url, operation, published) {
      if (!config || config.verifyWrite === false) return;
      const check = await verifyRemoteContent(url, snapshot, expectedBody, operation);
      if (check.ok) {
        log("debug", `写回后自校验通过（${check.detail}）`);
        return;
      }
      log("error", `写回后自校验失败：${check.detail}`);
      throw fault(
        "WRITE_VERIFY_FAILED",
        published ? `写入云端后自校验没通过（${check.detail}）。云端文件现在是坏的，栖弦会读不了；请先恢复备份的那个 sync-v1.json，再重试同步。` : `临时文件自校验没通过（${check.detail}）。正式文件未被改动，栖弦不受影响，直接重试即可。`
      );
    }
    async function verifyRemoteContent(url, snapshot, expectedBody, operation) {
      let response;
      try {
        response = await request("GET", url, { operation });
      } catch (error) {
        return { ok: false, detail: "回读失败：" + (error && error.message || "未知错误") };
      }
      if (response.status < 200 || response.status >= 300)
        return { ok: false, detail: `回读返回 HTTP ${response.status}` };
      const raw = response.body;
      if (raw && typeof raw === "object") {
        return hasher(raw) === hasher(snapshot) ? { ok: true, detail: `内容一致（${expectedBody.length} 字符）` } : { ok: false, detail: "回读到的 JSON 结构合法但内容与写入的不一致" };
      }
      const text2 = typeof raw === "string" ? raw : "";
      if (!text2)
        return {
          ok: false,
          detail: `回读内容为空（写入 ${expectedBody.length} 字符）——文件没写进去或被清空了`
        };
      try {
        const parsed = JSON.parse(text2);
        return hasher(parsed) === hasher(snapshot) ? { ok: true, detail: `内容一致（${text2.length} 字符）` } : { ok: false, detail: "回读到的 JSON 结构合法但内容与写入的不一致" };
      } catch {
        const truncated = expectedBody.startsWith(text2);
        return {
          ok: false,
          detail: `回读到的不是合法 JSON（写入 ${expectedBody.length} 字符，读回 ${text2.length} 字符` + (truncated ? "，且读回内容是写入内容的前缀→文件被截断了" : "") + "）"
        };
      }
    }
    async function probeMoveSupport(operation) {
      const from = syncDirUrl() + "/" + MOVE_PROBE_FROM;
      const to = syncDirUrl() + "/" + MOVE_PROBE_TO;
      try {
        const created = await request("PUT", from, {
          body: "{}",
          headers: { "Content-Type": "application/json" },
          timeoutMs: 15e3,
          operation
        });
        if (created.status < 200 || created.status >= 300) return "unknown";
        const moved = await request("MOVE", from, {
          headers: { Destination: to, Overwrite: "T" },
          timeoutMs: 15e3,
          operation
        });
        const supported = moved.status >= 200 && moved.status < 300;
        log("debug", `MOVE 探测：${supported ? "支持（写回走原子写）" : "不支持（写回直接覆盖）"}`);
        return supported ? "supported" : "unsupported";
      } catch {
        return "unknown";
      } finally {
        for (const url of [from, to]) {
          try {
            await request("DELETE", url, { timeoutMs: 15e3, operation });
          } catch {
          }
        }
      }
    }
    async function probeConditionalWrite(operation) {
      const probeUrl = syncDirUrl() + "/" + PROBE_FILE_NAME;
      try {
        const created = await request("PUT", probeUrl, {
          body: "{}",
          headers: { "Content-Type": "application/json" },
          timeoutMs: 15e3,
          operation
        });
        if (created.status < 200 || created.status >= 300) return "unknown";
        const guarded = await request("PUT", probeUrl, {
          body: "{}",
          headers: { "Content-Type": "application/json", "If-Match": '"ceru-probe-mismatch"' },
          timeoutMs: 15e3,
          operation
        });
        const supported = guarded.status === 412;
        log("debug", `条件写探测（If-Match）：${supported ? "支持" : "不支持"}`);
        return supported ? "supported" : "unsupported";
      } catch {
        return "unknown";
      } finally {
        try {
          await request("DELETE", probeUrl, { timeoutMs: 15e3, operation });
        } catch {
        }
      }
    }
    async function ensureLibraryAccess(operation) {
      let availability;
      try {
        availability = await ctx.capabilities.get("library");
      } catch {
        throw fault("UNSUPPORTED", "当前澜音没有歌单写入能力");
      }
      const methods = availability && availability.methods || [];
      if (!availability || !availability.available || !methods.some((m) => m.endsWith(".import")))
        throw fault("UNSUPPORTED", "当前澜音没有歌单写入能力，请在桌面端使用");
      return operation;
    }
    async function matchLocalPlaylist(playlistName, operation) {
      const listResult = await ctx.library.playlists.list({
        permissionKey: "cyshine.read",
        operation
      });
      const locals = listResult && listResult.items || [];
      const match = locals.find(
        (p) => p && p.ref && p.ref.location === "local" && p.name === playlistName
      );
      return match ? match.ref : void 0;
    }
    async function listLocalPlaylists(operation) {
      const listResult = await ctx.library.playlists.list({
        permissionKey: "cyshine.read",
        operation
      });
      const items = listResult && listResult.items || [];
      const targets = targetNames();
      return items.filter((p) => p && p.ref && p.ref.location === "local" && p.name).filter((p) => !targets.length || targets.includes(p.name)).map((p) => ({ name: p.name, ref: p.ref }));
    }
    function targetNames() {
      return str(config && config.syncPlaylists).split(",").map((s) => s.trim()).filter(Boolean);
    }
    async function readLocalTracks(target, operation) {
      const items = [];
      let cursor;
      let guard = 0;
      do {
        const page = await ctx.library.playlists.getTracks({
          target,
          permissionKey: "cyshine.read",
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
          permissionKey: "cyshine.write",
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
    async function buildInitialSnapshot(operation) {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      let names = targetNames();
      if (!names.length) names = (await listLocalPlaylists(operation)).map((p) => p.name);
      const data = [];
      let skippedTracks = 0;
      for (const name of names) {
        const target = await matchLocalPlaylist(name, operation);
        if (!target) continue;
        const tracks = await readLocalTracks(target, operation);
        const converted = [];
        for (const item of tracks) {
          const track = itemToRemoteTrack(item);
          if (track) converted.push(track);
          else skippedTracks++;
        }
        data.push(newPlaylistEntry(name, converted, now));
      }
      return { snapshot: buildSnapshot(data, now), skippedTracks };
    }
    async function sleepSafe(ms) {
      try {
        await new Promise((r) => setTimeout(r, ms));
      } catch {
      }
    }
    function loadTombstones(raw, nowMs) {
      const out = {};
      const source = asRecord(raw) || {};
      for (const name of Object.keys(source)) {
        const table = asRecord(source[name]);
        if (!table) continue;
        const kept = {};
        const keys = Object.keys(table);
        for (const key of keys.slice(Math.max(0, keys.length - TOMBSTONE_MAX_PER_PLAYLIST))) {
          const entry = asRecord(table[key]);
          if (!entry) continue;
          const at = Date.parse(str(entry.at));
          if (Number.isFinite(at) && nowMs - at > TOMBSTONE_MAX_AGE_MS) continue;
          kept[key] = { by: entry.by, at: entry.at };
        }
        if (Object.keys(kept).length) out[name] = kept;
      }
      return out;
    }
    async function doSync(operation, options = {}) {
      if (!config) throw fault("AUTH_REQUIRED", "请先在「连接 WebDAV」中保存配置");
      if (busy) throw fault("INVALID_INPUT", "同步正在进行，请稍候");
      busy = true;
      if (operation) lastOperationRef = operation;
      try {
        await ensureLibraryAccess(operation);
        const fetched = await tryFetchSnapshot(operation);
        let snapshot;
        let initialized = false;
        if (fetched) {
          snapshot = fetched;
        } else {
          initialized = true;
          const built = await buildInitialSnapshot(operation);
          snapshot = built.snapshot;
        }
        const remoteHashAtFetch = hasher(snapshot);
        const allPlaylists = parsePlaylists(snapshot);
        const targets = targetNames();
        if (targets.length) {
          const remoteNames = new Set(allPlaylists.map((p) => str(p.name)));
          const missing = targets.filter((name) => !remoteNames.has(name));
          if (missing.length && !initialized)
            throw fault(
              "EMPTY",
              `云端没有这些歌单：${missing.join("、")}。请核对「要同步的歌单」里的名字（英文逗号分隔）`
            );
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const nowMs = Date.now();
        const localPlaylists = await listLocalPlaylists(operation);
        const localNames = localPlaylists.map((p) => p.name);
        const effectivePlaylists = targets.length ? allPlaylists.filter((p) => targets.includes(str(p.name))) : allPlaylists;
        for (const name of Object.keys(pendingImports)) {
          if (!effectivePlaylists.some((p) => str(p.name) === name)) delete pendingImports[name];
        }
        const savedSnap = asRecord(await ctx.storage.get(BASELINE_KEY)) || {};
        const lastSnap = {};
        for (const name of Object.keys(savedSnap))
          if (Array.isArray(savedSnap[name])) lastSnap[name] = savedSnap[name].filter(Boolean);
        const tombstones = loadTombstones(await ctx.storage.get(TOMBSTONE_KEY), nowMs);
        const reconcile = reconcilePlaylists({
          lastSnap,
          remoteNames: allPlaylists.map((p) => str(p.name)),
          localNames,
          remoteDeletedTomb: await ctx.storage.get(PLAYLIST_TOMBSTONE_KEY),
          now
        });
        for (const name of reconcile.droppedFromBaseline) delete lastSnap[name];
        const playlistTombstones = reconcile.tombstones;
        if (reconcile.remoteDeleted.length)
          log(
            "info",
            `栖弦已删除整个歌单：${reconcile.remoteDeleted.join("、")}（澜音侧歌单保留，需你手动清理；不会回写云端）`
          );
        if (options.checkChange) {
          const prevRemote = await ctx.storage.get(LAST_HASH_KEY);
          const prevLocal = await ctx.storage.get(LOCAL_HASH_KEY);
          const remoteChanged2 = prevRemote !== remoteHashAtFetch;
          const localHash = await computeLocalHash(operation);
          const localChanged = prevLocal !== localHash;
          if (!remoteChanged2 && !localChanged) {
            const pendingNames = Object.keys(pendingImports);
            const pendingTotal = pendingNames.reduce((n, name) => n + (pendingImports[name] || 0), 0);
            if (pendingNames.length) {
              const shown = pendingNames.length <= 2 ? pendingNames.join("、") : `${pendingNames.slice(0, 2).join("、")} 等 ${pendingNames.length} 个`;
              log(
                "info",
                `云端没有新变化，但仍有 ${pendingNames.length} 个歌单（共 ${pendingTotal} 首）待手动导入：${pendingNames.join("、")}`
              );
              status = `云端无新变化；仍有 ${pendingTotal} 首待手动导入（${shown}）——点「立即同步」新建同名歌单即可导入`;
            } else {
              log("debug", "变化检测：云端与本地均无变化，跳过本次同步");
              status = "歌单无变化，已是最新";
            }
            await updateState();
            return { unchanged: true, playlists: 0, imported: 0, skipped: 0, pending: pendingTotal };
          }
          log(
            "info",
            "变化检测命中，执行同步" + (remoteChanged2 ? "（云端内容变化）" : "（本地内容变化）")
          );
        }
        log(
          "info",
          (initialized ? "初始化同步" : "开始同步") + `（${options.auto ? "自动" : "手动"}）：云端 ${allPlaylists.length} 个歌单，本地 ${localPlaylists.length} 个` + (targets.length ? `（限定：${targets.join("、")}）` : "")
        );
        const progress = await createProgress("同步栖弦歌单（双向）");
        const deletedPlaylistGroups = reconcile.remoteDeleted.map((name) => ({
          playlist: name,
          wholePlaylist: true,
          songs: []
        }));
        let playlistsDone = 0;
        let imported = 0;
        let skipped = 0;
        let writtenAdded = 0;
        let writtenRemoved = 0;
        let cleanCount = 0;
        let unwritable = 0;
        let noTargetSkipped = 0;
        const newPending = [];
        let casConflict = false;
        let remoteChanged = false;
        let cancelled = false;
        try {
          for (let i = 0; i < allPlaylists.length; i++) {
            const pl = allPlaylists[i];
            const name = str(pl.name) || "栖弦歌单 " + (i + 1);
            if (targets.length && !targets.includes(name)) continue;
            const plTracks = Array.isArray(pl.tracks) ? pl.tracks : [];
            await progress.update(
              `正在同步歌单 ${i + 1}/${allPlaylists.length}：「${name}」（远端 ${plTracks.length} 首）`
            );
            let target;
            try {
              target = await matchLocalPlaylist(name, operation);
            } catch (error) {
              if (error && error.code === "CANCELLED") throw error;
              log("warn", `读取本地歌单「${name}」失败，本次跳过该歌单：${error && error.message}`);
              continue;
            }
            if (!target && Array.isArray(lastSnap[name])) {
              log("info", `检测到澜音已删除歌单「${name}」，将同步移除云端条目`);
              pl.removed = true;
              delete lastSnap[name];
              remoteChanged = true;
              playlistsDone++;
              continue;
            }
            const localItems = target ? await readLocalTracks(target, operation) : [];
            const result = planPlaylistSync({
              remoteTracks: plTracks,
              localItems,
              lastKeys: lastSnap[name] || [],
              tombstones: tombstones[name] || {},
              now
            });
            tombstones[name] = result.tombstones;
            unwritable += result.unwritable;
            let didImport = false;
            let importedHere = 0;
            if (result.importItems.length) {
              const items = result.importItems.map((track) => trackToItem(track, ctx.plugin.id)).filter(Boolean);
              if (options.auto && !target) {
                noTargetSkipped += items.length;
                if (pendingImports[name] !== items.length) newPending.push(name);
                pendingImports[name] = items.length;
                log(
                  "info",
                  `歌单「${name}」有 ${items.length} 首待导入，但本地没有同名歌单；自动同步已跳过（请手动同步一次以新建歌单）`
                );
              } else if (items.length) {
                const outcome = await importPlaylist(
                  name,
                  items,
                  "cyshine:" + Date.now() + ":" + i,
                  operation,
                  target
                );
                if (outcome.cancelled) {
                  cancelled = true;
                  log(
                    "info",
                    `歌单「${name}」的导入被取消，本次同步到此为止（基线不会收录未导入的歌）`
                  );
                  break;
                }
                imported += outcome.added;
                importedHere = outcome.added;
                skipped += outcome.skipped;
                target = outcome.target || target;
                didImport = true;
                delete pendingImports[name];
              }
            }
            if (result.writeAddedItems.length || result.writeRemovedKeys.length) {
              let tracks = plTracks.slice();
              if (result.writeAddedItems.length) {
                const added = result.writeAddedItems.map(itemToRemoteTrack).filter(Boolean);
                tracks = [...added, ...tracks];
              }
              if (result.writeRemovedKeys.length) {
                const rm = new Set(result.writeRemovedKeys);
                tracks = tracks.filter((t) => !rm.has(remoteTrackKey(t)));
              }
              pl.tracks = tracks;
              remoteChanged = true;
              writtenAdded += result.writeAddedItems.length;
              writtenRemoved += result.writeRemovedKeys.length;
            }
            let localKeysForBaseline = result.localKeys;
            if (didImport && target) {
              const after = await readLocalTracks(target, operation);
              localKeysForBaseline = new Set(after.map(localItemKey).filter(Boolean));
            }
            const baseline = appliedBaseline({
              localKeys: localKeysForBaseline,
              importKeys: [],
              remoteKeysAfter: result.remoteKeysAfter
            });
            if (baseline.length) lastSnap[name] = baseline;
            else delete lastSnap[name];
            if (result.cleanSongs.length) {
              cleanCount += result.cleanSongs.length;
              deletedPlaylistGroups.push({
                playlist: name,
                wholePlaylist: false,
                songs: result.cleanSongs
              });
            }
            log(
              "info",
              `歌单「${name}」完成：导入 ${didImport ? importedHere : 0} 首，写回新增 ${result.writeAddedItems.length} 首，写回删除 ${result.writeRemovedKeys.length} 首` + (result.cleanSongs.length ? `，待清理 ${result.cleanSongs.length} 首` : "") + (result.unwritable ? `，${result.unwritable} 首非平台歌曲跳过（栖弦放不下）` : "")
            );
            playlistsDone++;
          }
          if (initialized) remoteChanged = true;
          if (!cancelled) {
            const localByName = new Map(localPlaylists.map((p) => [p.name, p]));
            for (const name of reconcile.pushCandidates) {
              const lp = localByName.get(name);
              if (!lp) continue;
              const tracks = await readLocalTracks(lp.ref, operation);
              const converted = [];
              let dropped = 0;
              for (const item of tracks) {
                const track = itemToRemoteTrack(item);
                if (track) converted.push(track);
                else dropped++;
              }
              unwritable += dropped;
              if (!converted.length) {
                log("info", `本地新增歌单「${name}」没有可同步到栖弦的平台歌曲，跳过`);
                continue;
              }
              const plSection = asRecord(
                asRecord(snapshot.sections) && asRecord(snapshot.sections).playlists
              );
              if (!plSection || !Array.isArray(plSection.data)) continue;
              plSection.data.push(newPlaylistEntry(name, converted, now));
              lastSnap[name] = converted.map(remoteTrackKey).filter(Boolean).sort();
              remoteChanged = true;
              log("info", `本地新增歌单「${name}」：写回云端 ${converted.length} 首`);
            }
          }
          const section = asRecord(
            asRecord(snapshot.sections) && asRecord(snapshot.sections).playlists
          );
          if (section && Array.isArray(section.data)) {
            const before = section.data.length;
            section.data = section.data.filter((p) => !asRecord(p)?.removed);
            for (const p of section.data) if (asRecord(p)) delete p.removed;
            if (section.data.length !== before) remoteChanged = true;
          }
          let committed = !cancelled;
          if (remoteChanged && !cancelled) {
            if (section) section.modifiedAt = now;
            snapshot.generatedAt = now;
            if (initialized) {
              const res = await writeSnapshot(snapshot, operation);
              if (res && res.conflicted) casConflict = true;
            } else if (config.verifyWrite === false) {
              log("info", "快速写回：未做并发校验（设置里关闭了「写回前校验」）");
              const res = await writeSnapshot(snapshot, operation);
              if (res && res.conflicted) casConflict = true;
            } else {
              const support = await ctx.storage.get(CAS_SUPPORT_KEY);
              if (support === "supported" && lastFetchMeta && lastFetchMeta.etag) {
                const res = await writeSnapshot(snapshot, operation, { ifMatch: lastFetchMeta.etag });
                if (res && res.conflicted) casConflict = true;
              } else {
                let conflicted = false;
                try {
                  conflicted = hasher(await fetchSnapshot(operation)) !== remoteHashAtFetch;
                } catch {
                  conflicted = true;
                }
                if (conflicted) casConflict = true;
                else {
                  const res = await writeSnapshot(snapshot, operation);
                  if (res && res.conflicted) casConflict = true;
                }
              }
            }
            if (casConflict) committed = false;
            log(
              "info",
              `写回云端${casConflict ? "被取消（远端并发修改）" : "完成"}：新增 ${writtenAdded} 首，删除 ${writtenRemoved} 首` + (casConflict ? " —— 请重新同步一次" : "")
            );
          } else if (cancelled) {
            log("info", "本次同步因用户取消而未写回云端");
          }
          await progress.close();
          const summary = {
            playlists: playlistsDone,
            imported,
            skipped,
            writtenAdded,
            writtenRemoved,
            cleanCount,
            unwritable,
            noTargetSkipped,
            casConflict,
            cancelled,
            initialized,
            committed,
            deletedPlaylists: reconcile.remoteDeleted.length,
            total: allPlaylists.length
          };
          await ctx.storage.set(LAST_SYNC_KEY, { at: now, ...summary });
          await ctx.storage.set(PENDING_KEY, pendingImports);
          if (options.auto && newPending.length) {
            const total = newPending.reduce((n, name) => n + (pendingImports[name] || 0), 0);
            log(
              "info",
              `发现 ${newPending.length} 个歌单本地没有同名歌单（共 ${total} 首），已记入待手动导入清单`
            );
            try {
              await ctx.ui.toast({
                level: "warning",
                message: `栖弦有 ${newPending.length} 个歌单在澜音里还没有同名歌单（共 ${total} 首）。点插件里的「立即同步」会弹出新建歌单，确认后即可导入。`
              });
            } catch {
            }
          }
          if (committed) {
            await ctx.storage.set(LAST_HASH_KEY, hasher(snapshot));
            await ctx.storage.set(BASELINE_KEY, lastSnap);
            await ctx.storage.set(TOMBSTONE_KEY, pruneTombstones(tombstones));
            await ctx.storage.set(PLAYLIST_TOMBSTONE_KEY, playlistTombstones);
            await ctx.storage.set(LOCAL_HASH_KEY, await computeLocalHash(operation));
            await ctx.storage.set(DELETIONS_KEY, {
              at: now,
              deletions: deletedPlaylistGroups.filter((d) => d.songs.length),
              deletedPlaylists: deletedPlaylistGroups.filter((d) => d.wholePlaylist).map((d) => d.playlist)
            });
          } else {
            log("info", "本轮未完全落实，已保留上一轮基线与墓碑，下次同步会重新推导（不会丢变更）");
          }
          lastSyncAt = now;
          lastSyncCommitted = committed;
          status = buildStatusText(summary, cleanCount, noTargetSkipped);
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
    function pruneTombstones(tables) {
      const out = {};
      for (const name of Object.keys(tables)) {
        const table = tables[name];
        if (!table || !Object.keys(table).length) continue;
        out[name] = table;
      }
      return out;
    }
    function buildStatusText(summary, cleanCount, noTargetSkipped) {
      if (summary.initialized)
        return `已用 ${summary.playlists} 个澜音本地歌单初始化云端，栖弦同步后即可读取`;
      const parts = [`导入 ${summary.imported} 首`];
      if (summary.writtenAdded) parts.push(`写回新增 ${summary.writtenAdded} 首`);
      if (summary.writtenRemoved) parts.push(`写回删除 ${summary.writtenRemoved} 首`);
      if (summary.deletedPlaylists) parts.push(`云端歌单删除 ${summary.deletedPlaylists} 个`);
      if (summary.skipped) parts.push(`跳过重复 ${summary.skipped} 首`);
      if (summary.unwritable) parts.push(`${summary.unwritable} 首非平台歌曲未同步`);
      if (noTargetSkipped) parts.push(`${noTargetSkipped} 首因本地无同名歌单待手动同步`);
      if (cleanCount) parts.push(`栖弦已删除 ${cleanCount} 首待你手动清理`);
      if (summary.cancelled) parts.push("导入被取消，未写回云端");
      if (summary.casConflict) parts.push("远端被并发修改，写回已取消，请重新同步");
      return "双向同步完成：" + parts.join("，");
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
        syncPlaylists: config ? config.syncPlaylists || "" : "",
        autoSync: config ? config.autoSync : false,
        syncInterval: config ? config.syncInterval || 3 : 3,
        verifyWrite: config ? config.verifyWrite !== false : true,
        remember: config ? config.remember : true,
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
      const candidate = {
        serverUrl,
        username,
        password: password || config && config.password || "",
        syncPlaylists: str(input && input.syncPlaylists),
        autoSync: input && input.autoSync === true,
        syncInterval,
        verifyWrite: input && input.verifyWrite !== false,
        remember: input && input.remember === true
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
        await ctx.storage.set(CAS_SUPPORT_KEY, await probeConditionalWrite(operation));
        await ctx.storage.set(MOVE_SUPPORT_KEY, await probeMoveSupport(operation));
        const snapshot = await tryFetchSnapshot(operation);
        let count = 0;
        let toast;
        if (snapshot) {
          count = parsePlaylists(snapshot).length;
          status = count ? `连接正常，WebDAV 里有 ${count} 个栖弦歌单` : "连接正常，但云端 sync-v1.json 里还没有歌单";
          toast = count ? `配置已保存，WebDAV 连接正常（${count} 个歌单）` : status;
        } else {
          const built = await buildInitialSnapshot(operation);
          count = parsePlaylists(built.snapshot).length;
          await writeSnapshot(built.snapshot, operation);
          status = count ? `云端没有同步文件，已用澜音 ${count} 个本地歌单创建初始歌单` : "云端没有同步文件，且本地也没有可初始化的歌单，已创建空同步文件";
          toast = count ? `云端无数据，已用澜音 ${count} 个歌单创建初始同步文件，栖弦同步后即可读取` : "云端无数据，已创建空同步文件；请在澜音建歌单或在栖弦同步后重新保存";
        }
        if (candidate.remember) await ctx.storage.set(STORAGE_KEY, candidate);
        else await ctx.storage.delete(STORAGE_KEY);
        await syncAutoTimer();
        const casSupport = await ctx.storage.get(CAS_SUPPORT_KEY);
        const moveSupport = await ctx.storage.get(MOVE_SUPPORT_KEY);
        log(
          "info",
          (casSupport === "supported" ? "服务器支持 ETag 条件写（If-Match），写回可防并发覆盖" : casSupport === "unsupported" ? '服务器不支持条件写，写回采用"写回前重新校验"的保守策略' : "未能探测条件写支持，写回采用保守策略") + "；" + (moveSupport === "supported" ? "并支持 MOVE，写回采用原子写（先写临时文件→校验→替换）" : "不支持 MOVE，写回为直接覆盖 + 写回后自校验")
        );
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
        id: "cyshine:evt:" + Date.now(),
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
            { permissionKey: "cyshine.read" }
          )
        );
      }
    } catch {
    }
    register("deletions.open-view", () => ctx.ui.openView("deletions"));
    register(
      "deletions.view",
      defineNativeView(async () => {
        const data = await ctx.storage.get(DELETIONS_KEY);
        const deletions = data && Array.isArray(data.deletions) ? data.deletions : [];
        const deletedPlaylists = data && Array.isArray(data.deletedPlaylists) ? data.deletedPlaylists : [];
        if (!deletions.length && !deletedPlaylists.length) {
          return {
            type: "page",
            title: "待清理清单",
            description: "当前没有检测到需要在澜音本地手动清理的内容。",
            sections: []
          };
        }
        const sections = deletions.map((d) => ({
          id: "pl-" + String(d.playlist || "p").replace(/[^\w\u4e00-\u9fa5-]/g, "_"),
          title: `${d.playlist}（${d.songs.length} 首）`,
          // 用 grid 布局：宿主 list 布局会硬编码渲染「播放」文字，grid 布局无播放按钮，且不会误触发跳转
          layout: "grid",
          items: (d.songs || []).map((s) => ({
            ref: {
              pluginId: "ceru.cyshine-webdav",
              providerId: "local",
              kind: "track",
              id: String(s.id)
            },
            title: s.title || String(s.id),
            subtitle: "栖弦已删除，请在本地同名歌单手动清理",
            capabilities: [],
            metadata: { artists: [], artworkUrl: s.artworkUrl || "" }
          }))
        }));
        for (const name of deletedPlaylists) {
          sections.push({
            id: "whole-" + String(name).replace(/[^\w\u4e00-\u9fa5-]/g, "_"),
            title: `整个歌单已被栖弦删除：${name}`,
            layout: "grid",
            items: [
              {
                ref: {
                  pluginId: "ceru.cyshine-webdav",
                  providerId: "local",
                  kind: "track",
                  id: "deleted-playlist:" + name
                },
                title: name,
                subtitle: "栖弦已删除该歌单，澜音里仍保留，请手动删除本地的同名歌单",
                capabilities: [],
                metadata: { artists: [] }
              }
            ]
          });
        }
        return {
          type: "page",
          title: "待清理清单",
          description: "澜音 v2 插件无法删除本地歌单/歌曲，所以栖弦端删除的内容需要你在这里按歌单名手动清理一次。清理后清单会自动消失。",
          sections
        };
      })
    );
    async function syncAutoTimer(silent) {
      try {
        if (config && config.autoSync) {
          const minutes = config && config.syncInterval || 3;
          await ctx.tasks.schedule(
            { id: AUTO_SYNC_TASK_ID, commandId: "sync.check", intervalMs: minutes * 6e4 },
            { permissionKey: "cyshine.background" }
          );
          if (!silent) status = `已开启自动同步（约每 ${minutes} 分钟检测歌单变化）`;
          log("info", `自动同步定时器已排期：每 ${minutes} 分钟检测一次`);
        } else {
          try {
            await ctx.tasks.cancel(AUTO_SYNC_TASK_ID, { permissionKey: "cyshine.background" });
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
        await ctx.tasks.cancel(AUTO_SYNC_TASK_ID, { permissionKey: "cyshine.background" });
        log("debug", "已取消自动同步定时任务");
      } catch {
      }
      await ctx.storage.delete(STORAGE_KEY);
      config = null;
      status = "已断开，配置已清除（同步基线保留，重新连接后继续沿用）";
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
          syncPlaylists: str(saved.syncPlaylists),
          autoSync: saved.autoSync === true,
          syncInterval: parseMinutes(saved.syncInterval),
          verifyWrite: saved.verifyWrite !== false,
          remember: true
        };
        status = "已载入连接，等待同步";
      } catch {
        status = "已保存的配置无效，请重新设置";
        config = null;
      }
    }
    await updateState();
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
const resources = {"schema.settings":{"type":"json","value":{"schemaVersion":"1.0","id":"settings","presentation":{"kind":"drawer","placement":"right","size":480,"openOnFirstUse":true},"root":{"type":"form","title":"栖弦歌单同步","submitAction":"settings.save","submitInput":{"mode":"save"},"submitLabel":"保存并测试","children":[{"type":"text","bind":"status"},{"type":"text","bind":"lastSyncText"},{"type":"text","bind":"pendingText"},{"type":"text-input","bind":"serverUrl","label":"WebDAV 地址","placeholder":"https://你的服务器/dav/music","description":"填手机栖弦「数据同步」里使用的同一个 WebDAV 地址，插件会自动读取它下面的 CyShineMusic/sync-v1.json。若云端还没有这个文件，保存时会自动用澜音本地歌单创建一份初始歌单。","required":true},{"type":"text-input","bind":"username","label":"用户名","placeholder":"AList 账号","required":true},{"type":"password","bind":"password","label":"密码","placeholder":"留空则沿用已保存的密码"},{"type":"text","bind":"passwordStatus"},{"type":"text-input","bind":"syncPlaylists","label":"要同步的歌单","placeholder":"如：纯音乐, 我的最爱（留空 = 同步全部）","description":"填栖弦歌单名，多个用英文逗号分隔。只同步列出的歌单，每个导入到澜音同名歌单；同名歌单不存在时会自动新建。"},{"type":"toggle","bind":"autoSync","label":"自动同步（检测歌单变化）","description":"开启后，歌单一有变化（无论是栖弦还是澜音）就会自动同步；默认关闭。"},{"type":"number","bind":"syncInterval","label":"自动同步间隔（分钟）","placeholder":"3","description":"自动同步多久检测一次，默认 3 分钟，可填 1~60。改完必须点下面的「保存并测试」才生效（点「立即同步」不会应用设置）；保存后看上方状态栏会写明实际生效的分钟数。留空则沿用上次的值。"},{"type":"toggle","bind":"remember","label":"在本机记住配置","description":"保存 WebDAV 地址与账号密码到本机，下次免填。"},{"type":"toggle","bind":"verifyWrite","label":"写回前校验（防覆盖）","description":"开启（推荐）：写回前下载比对，防止覆盖栖弦新数据；关闭可让写回更快（适合单设备自用）。"},{"type":"button","label":"立即同步","action":"sync.run","requires":"connected"},{"type":"button","label":"查看待清理清单","action":"deletions.open-view","requires":"connected"},{"type":"button","label":"断开连接并清除配置","action":"settings.save","input":{"mode":"disconnect"},"requires":"connected"}]}}}};

// Public plugin exports

exports.activate = LogicMain;

exports.resources = resources;
