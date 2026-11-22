exports.manifest = {
  manifestVersion: 3,
  id: "ceru.netease-account",
  name: "网易云账号",
  version: "1.6.3",
  author: "CeruMusic",
  description: "扫码登录网易云，搜索歌曲与歌单，浏览推荐、歌单分类和排行榜，并按账号权限播放音乐",
  homepage: "https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced",
  engines: {
    hostApi: "^3.0.0",
    logicRuntime: "ceru-js@1"
  },
  entry: {
    views: [
      {
        id: "account",
        kind: "native",
        title: "网易云账号",
        presentation: {
          kind: "modal",
          size: 360
        },
        module: "render.account"
      },
      {
        id: "daily",
        kind: "native",
        title: "每日推荐",
        presentation: {
          kind: "drawer",
          placement: "right",
          size: 760
        },
        module: "render.daily"
      },
      {
        id: "library",
        kind: "native",
        title: "我的网易云歌单",
        module: "render.library"
      }
    ],
    logic: {
      module: "logic.main"
    }
  },
  provides: {
    actions: [
      {
        id: "render.daily",
        title: "渲染网易云推荐"
      },
      {
        id: "render.library",
        title: "渲染我的歌单"
      },
      {
        id: "daily.refresh",
        title: "刷新网易云推荐"
      },
      {
        id: "library.refresh",
        title: "刷新我的歌单"
      },
      {
        id: "library.page",
        title: "歌单翻页"
      },
      {
        id: "daily.open",
        title: "查看网易云推荐",
        view: "daily"
      },
      {
        id: "library.open",
        title: "查看我的歌单"
      },
      {
        id: "daily",
        title: "每日推荐"
      },
      {
        id: "library",
        title: "我的网易云歌单"
      },
      {
        id: "open",
        title: "网易云账号",
        view: "account"
      },
      {
        id: "play",
        title: "播放歌曲"
      },
      {
        id: "playlist.open",
        title: "打开歌单"
      },
      {
        id: "playlist.import",
        title: "导入歌单"
      },
      {
        id: "playlist.import.open",
        title: "打开网易云歌单导入"
      },
      {
        id: "daily.eligible",
        title: "判断推荐入口"
      },
      {
        id: "render.account",
        title: "网易云账号状态"
      }
    ],
    providers: [
      {
        id: "wy",
        name: "网易云（账号）",
        protocols: [
          "music.search@1",
          "music.resolve@1",
          "music.lyrics@1",
          "music.playlists@1",
          "music.charts@1"
        ],
        qualities: [
          "128k",
          "192k",
          "320k",
          "flac",
          "hires",
          "atmos",
          "atmos_plus",
          "master"
        ],
        icon: {
          kind: "host",
          name: "platform.wy"
        },
        connectionMode: "multiple"
      }
    ],
    importers: [
      {
        id: "netease-playlist",
        title: "网易云音乐",
        providerId: "wy",
        description: "使用登录账号读取有权访问的网易云歌单",
        placeholder: "歌单链接或歌单 ID",
        examples: [
          {
            label: "歌单链接",
            value: "https://music.163.com/playlist?id=123456789"
          }
        ]
      }
    ],
    accounts: [
      {
        id: "netease",
        title: "网易云账号",
        multiple: true,
        loginMethods: [
          "qrcode"
        ],
        providers: [
          "wy"
        ],
        capabilities: [
          "profile"
        ]
      }
    ]
  },
  uses: {
    permissions: [
      {
        key: "netease.network",
        name: "network.request",
        reason: "直连网易云完成扫码登录、获取个人音乐内容及播放地址"
      },
      {
        key: "playback",
        name: "player.control",
        reason: "点击播放推荐歌曲时更新播放队列"
      },
      {
        key: "netease.credential",
        name: "credentials.use",
        reason: "使用所选账号访问网易云音乐接口",
        scope: {
          origins: [
            "https://interfacepc.music.163.com"
          ]
        }
      }
    ]
  },
  ui: {
    pages: [
      {
        when: {
          selectedSource: "wy",
          predicate: "daily.eligible"
        },
        id: "daily",
        mount: "home-tab",
        view: "daily",
        order: 0,
        title: "网易云推荐"
      },
      {
        id: "account",
        title: "网易云账号",
        mount: "settings",
        view: "account"
      },
      {
        id: "library",
        title: "网易云歌单",
        mount: "playlist-section",
        order: 0,
        view: "library"
      }
    ],
    menus: [
      {
        id: "netease-playlist-import",
        slot: "playlist.import",
        title: "导入网易云歌单",
        description: "粘贴网易云歌单链接或 ID 并导入歌曲",
        commandId: "playlist.import.open"
      }
    ],
    homeSections: [
      {
        id: "netease-playlists",
        title: "歌单",
        kind: "playlists",
        providerIds: [
          "wy"
        ],
        icon: {
          kind: "host",
          name: "library"
        },
        order: 10
      },
      {
        id: "netease-charts",
        title: "排行榜",
        kind: "charts",
        providerIds: [
          "wy"
        ],
        icon: {
          kind: "host",
          name: "chart"
        },
        order: 20
      }
    ]
  },
  dataSchemas: {
    config: 1,
    state: 1
  }
};
exports.package = {
  formatVersion: 2,
  syntax: "js",
  signature: {
    mode: "single@1",
    algorithm: "ed25519",
    keyId: "sha256:3a40571eceb0ed00440a94a62e0709898ad1e930a2c9b7c1caad8f6b96049557",
    publicKey: "MCowBQYDK2VwAyEAa+usffm3lvIRac2JGqk7gdH+6BKkZCszGzZbBxhfDxU=",
    value: "9D2iCa7agCXge+eZrLyBTABxzY6gcv+j5gNWwejjfIbzqrS3M8KQCWG1Zcxe+3BF0QBdNxy8bWt5maK7LLxcBg=="
  }
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

  // node_modules/.pnpm/@shiqianjiang+ceru-plugin-s_51a2889e2daa43f90ff618f4790e5fa3/node_modules/@shiqianjiang/ceru-plugin-sdk/dist/music.js
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

  // node_modules/.pnpm/@shiqianjiang+ceru-plugin-s_51a2889e2daa43f90ff618f4790e5fa3/node_modules/@shiqianjiang/ceru-plugin-sdk/dist/lifecycle.js
  var LIFECYCLE_NAMES = ["onAppReady", "onInstall", "onUninstall", "onEnable", "onDisable", "onUpdate", "onOnline", "onOffline", "onLocaleChange", "onBeforeQuit", "onWindowShow", "onWindowHide", "onWindowFocus", "onWindowBlur", "onSuspend", "onResume", "onLock", "onUnlock", "onThemeChange", "onConfigChange", "onPermissionChange"];

  // node_modules/.pnpm/@shiqianjiang+ceru-plugin-s_51a2889e2daa43f90ff618f4790e5fa3/node_modules/@shiqianjiang/ceru-plugin-sdk/dist/native-view.js
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

  // node_modules/.pnpm/@shiqianjiang+ceru-plugin-s_51a2889e2daa43f90ff618f4790e5fa3/node_modules/@shiqianjiang/ceru-plugin-sdk/dist/index.js
  function definePlugin(entry) {
    if (typeof entry === "function")
      return entry;
    return (ctx) => {
      const single = ctx.lifecycleOnly;
      if (single) {
        if (single === "onUpdate" && entry.onUpdate)
          ctx.lifecycle.onUpdate((update) => entry.onUpdate(ctx, update));
        else if (single !== "onUpdate" && entry[single])
          ctx.lifecycle[single](() => entry[single](ctx));
        return;
      }
      for (const name of LIFECYCLE_NAMES) {
        const handler = entry[name];
        if (!handler)
          continue;
        if (name === "onThemeChange")
          ctx.lifecycle.onThemeChange((theme) => entry.onThemeChange(ctx, theme));
        else if (name === "onUpdate")
          ctx.lifecycle.onUpdate((update) => entry.onUpdate(ctx, update));
        else if (name === "onLocaleChange")
          ctx.lifecycle.onLocaleChange((locale) => entry.onLocaleChange(ctx, locale));
        else if (name === "onConfigChange" || name === "onPermissionChange")
          ctx.lifecycle[name]((keys) => entry[name](ctx, keys));
        else
          ctx.lifecycle[name](() => entry[name](ctx));
      }
      if (entry.onIdle) {
        const { milliseconds: milliseconds2, handler } = entry.onIdle;
        ctx.lifecycle.onIdle(milliseconds2, () => handler(ctx));
      }
      return entry.setup(ctx);
    };
  }

  // src/netease-client.js
  function createNeteaseClient(ctx, onExpired = async () => {
  }) {
    const crypto = ctx.modules.require("@ceru/crypto");
    const deviceId = crypto.randomBytes(16).toString("hex");
    const str = (value) => value == null ? "" : String(value);
    const failure = (message, code = "AUTH_REQUIRED") => Object.assign(new Error(message), { code });
    async function authorize(key, operation) {
      operation.signal.throwIfAborted();
      let grant = await ctx.permissions.query({ key });
      if (grant.status === "prompt" || grant.status === "denied")
        grant = await ctx.permissions.request({ key, intent: operation.userIntent });
      operation.signal.throwIfAborted();
      if (grant.status !== "granted")
        throw failure(key === "netease.credential" ? "请在插件权限中允许使用网易云账号凭据，再重新登录" : "请在插件权限中允许网易云网络访问", "PERMISSION_DENIED");
    }
    async function authorizeAccount(operation) {
      await authorize("netease.network", operation);
      await authorize("netease.credential", operation);
    }
    function aes(text2, key) {
      const cipher = crypto.createCipheriv("aes-128-ecb", key, null);
      return (cipher.update(text2).toString("hex") + cipher.final().toString("hex")).toUpperCase();
    }
    function cookieHeader(cookies) {
      return Object.entries(cookies).map(([key, value]) => key + "=" + encodeURIComponent(str(value))).join("; ");
    }
    function readCookies(header, jar) {
      const pattern = /(?:^|[,;]\s*)(MUSIC_U|MUSIC_A|__csrf|NMTID)=([^;,\s]*)/g;
      for (const match of str(header).matchAll(pattern)) {
        try {
          jar[match[1]] = decodeURIComponent(match[2]);
        } catch {
          jar[match[1]] = match[2];
        }
      }
    }
    async function api(path, input = {}, op, jar = {}, allowLoginCodes = false) {
      op.signal.throwIfAborted();
      await authorize("netease.network", op);
      if (jar.kind === "credential") await authorize("netease.credential", op);
      const header = {
        os: "pc",
        appver: "3.1.17.204416",
        osver: "Microsoft-Windows-10-Professional-build-19045-64bit",
        deviceId,
        channel: "netease",
        versioncode: "140",
        buildver: str(Math.floor(Date.now() / 1e3)),
        resolution: "1920x1080",
        requestId: Date.now() + "_" + Math.floor(Math.random() * 1e3),
        ...jar.kind === "credential" ? {} : jar
      };
      const text2 = JSON.stringify({ ...input, e_r: false, header });
      const digest = crypto.createHash("md5").update("nobody" + path + "use" + text2 + "md5forencrypt").digest("hex");
      const params = aes(path + "-36cd479b6b5-" + text2 + "-36cd479b6b5-" + digest, "e82ckenh8dichen8");
      const response = await ctx.http.request({
        url: "https://interfacepc.music.163.com/eapi/" + path.slice(5),
        method: "POST",
        permissionKey: "netease.network",
        operation: op,
        timeoutMs: 15e3,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: "https://music.163.com/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) NeteaseMusicDesktop/3.1.17.204416",
          ...jar.kind === "credential" ? {} : { Cookie: cookieHeader(header) }
        },
        ...jar.kind === "credential" ? { credential: jar } : {},
        body: new URLSearchParams({ params }).toString()
      });
      op.signal.throwIfAborted();
      if (response.status >= 400) throw failure("网易云请求失败，请稍后重试", "NETWORK_ERROR");
      const body = typeof response.body === "string" ? JSON.parse(response.body) : response.body;
      if (!body || typeof body !== "object") throw failure("网易云返回了无效响应", "NETWORK_ERROR");
      if (jar.kind !== "credential") readCookies(response.headers?.["set-cookie"], jar);
      const code = Number(body.code ?? 200);
      if (code === 301 || code === 302) {
        await onExpired(jar);
        throw failure("网易云登录已失效，请重新扫码登录");
      }
      if (code !== 200 && !(allowLoginCodes && [800, 801, 802, 803].includes(code)))
        throw failure(str(body.message || body.msg) || "网易云服务暂不可用", "NETWORK_ERROR");
      return body;
    }
    return { request: api, readCookies, cookieHeader, authorizeAccount };
  }

  // src/netease-qr.js
  function createNeteaseQr(client) {
    return {
      async start(operation) {
        const cookies = {};
        const result = await client.request("/api/login/qrcode/unikey", { type: 3 }, operation, cookies);
        const key = result.unikey || result.data?.unikey;
        if (typeof key !== "string" || !key || key.length > 2048) throw Object.assign(new Error("未获取到登录二维码，请重试"), { code: "NETWORK_ERROR" });
        return { key, cookies, url: "https://music.163.com/login?codekey=" + encodeURIComponent(key) };
      },
      async poll(attempt, operation) {
        const body = await client.request("/api/login/qrcode/client/login", { key: attempt.key, type: 3 }, operation, attempt.cookies, true);
        const code = Number(body.code);
        if (code === 803) {
          if (body.cookie) client.readCookies(body.cookie, attempt.cookies);
          if (!attempt.cookies.MUSIC_U) throw Object.assign(new Error("扫码成功但缺少登录凭据，请重新扫码"), { code: "AUTH_REQUIRED" });
          return "done";
        }
        if (code === 800) return "expired";
        return code === 802 ? "scanned" : "waiting";
      }
    };
  }

  // src/host-account.js
  function createHostAccount(client, loadProfile) {
    const qr = createNeteaseQr(client);
    return {
      async login({ method, auth }, operation) {
        if (method !== "qrcode") throw Error("此账号只支持扫码登录");
        await client.authorizeAccount(operation);
        const attempt = await qr.start(operation);
        try {
          return await auth.qrcode({
            url: attempt.url,
            expiresInMs: 18e4,
            async poll(pollOperation) {
              const status = await qr.poll(attempt, pollOperation);
              if (status !== "done") return { status };
              return {
                status,
                credential: client.cookieHeader(attempt.cookies),
                binding: { origin: "https://interfacepc.music.163.com", sendAs: "cookie" }
              };
            }
          });
        } finally {
          for (const name of Object.keys(attempt.cookies)) delete attempt.cookies[name];
        }
      },
      async profile(account, operation) {
        const { profile, membership } = await loadProfile(account.credential, operation);
        return { id: profile.userId, displayName: profile.nickname, ...profile.avatarUrl ? { avatar: profile.avatarUrl } : {}, vip: membership.tier !== "FREE" };
      },
      async validate(account, operation) {
        try {
          const result = await client.request("/api/w/nuser/account/get", {}, operation, account.credential);
          if (!(result.profile || result.data?.profile)?.userId) throw Error("平台未返回账号资料");
          return { valid: true };
        } catch (error) {
          if (error.code === "AUTH_REQUIRED") return { valid: false };
          throw error;
        }
      },
      async logout(account, operation) {
        try {
          await client.request("/api/logout", {}, operation, account.credential);
        } catch (error) {
          if (error.code !== "AUTH_REQUIRED") throw error;
        }
      }
    };
  }

  // src/index.js
  var index_default = definePlugin(async (ctx) => {
    const accountId = "netease";
    const providerId = "wy";
    const qualityLevels = {
      "128k": "standard",
      "192k": "higher",
      "320k": "exhigh",
      flac: "lossless",
      hires: "hires",
      atmos: "jyeffect",
      atmos_plus: "sky",
      master: "jymaster"
    };
    const legacyQualityIds = {
      ...Object.fromEntries(Object.entries(qualityLevels).map(([id, level]) => [level, id])),
      // Older plugin releases advertised vivid for the enhanced surround slot.
      vivid: "atmos_plus"
    };
    let session = null;
    let generation = 0;
    let connectionId = null;
    let invalidCredential = null;
    let refreshedAt = 0;
    let refreshing;
    const cache = /* @__PURE__ */ new Map();
    const qualityCache = /* @__PURE__ */ new Map();
    const libraryPages = /* @__PURE__ */ new Map();
    let libraryPage = 1;
    const asArray = (value) => Array.isArray(value) ? value : [];
    const str = (value) => value == null ? "" : String(value);
    const positive = (value) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
    const failure = (message, code = "AUTH_REQUIRED") => Object.assign(new Error(message), { code });
    const ref = (kind, id) => ({
      pluginId: ctx.plugin.id,
      providerId,
      kind,
      id: str(id),
      ...connectionId ? { connectionId } : kind === "track" ? { scope: "provider" } : {}
    });
    const operation = () => ({
      id: "netease-" + Date.now(),
      deadlineAt: Date.now() + 2e4,
      signal: new AbortController().signal
    });
    function pageNumber(cursor) {
      if (cursor != null && !/^[1-9]\d{0,6}$/.test(str(cursor)))
        throw failure("分页参数无效", "INVALID_INPUT");
      return Number(cursor || 1);
    }
    function resetAccount(next) {
      generation++;
      connectionId = next;
      session = null;
      invalidCredential = null;
      refreshing = void 0;
      refreshedAt = 0;
      cache.clear();
      libraryPages.clear();
      libraryPage = 1;
    }
    function assertGeneration(token) {
      if (token !== generation) throw failure("账号已切换，请重试");
    }
    const client = createNeteaseClient(ctx);
    async function rejectSession(token, usedConnection, handle) {
      if (generation !== token || !usedConnection || !handle) return;
      resetAccount(usedConnection);
      invalidCredential = handle.id;
      try {
        await ctx.accounts.reportExpired(accountId, usedConnection, handle);
      } finally {
        await publishAccount();
      }
    }
    const api = async (path, input = {}, op = operation(), handle = session?.credential) => {
      const token = generation, usedConnection = connectionId;
      if (op.connectionId && op.connectionId !== connectionId) throw failure("账号已切换，请重试");
      try {
        const result = await client.request(path, input, op, handle);
        assertGeneration(token);
        return result;
      } catch (error) {
        if (token === generation && handle && error.code === "AUTH_REQUIRED" && session?.credential.id === handle.id) {
          await rejectSession(token, usedConnection, handle);
        }
        throw error;
      }
    };
    function membership(profile, vip) {
      const data = vip?.data || {};
      const now = Date.now();
      const active = (item) => !!item && Number(item.expireTime) > now;
      const superVip = [data.redplus, data.superVip, data.svip].find(active);
      const normal = [data.associator, data.musicPackage].find(active);
      if (superVip) return { tier: "SVIP", expiresAt: Number(superVip.expireTime) };
      if (normal) return { tier: "VIP", expiresAt: Number(normal.expireTime) };
      const hasMembershipRecords = [
        data.redplus,
        data.superVip,
        data.svip,
        data.associator,
        data.musicPackage
      ].some((item) => item && Number.isFinite(Number(item.expireTime)));
      return {
        tier: !hasMembershipRecords && [10, 11].includes(Number(profile.vipType)) ? "VIP" : "FREE",
        expiresAt: 0
      };
    }
    function tier() {
      if (!session) return "FREE";
      if (session.membership.expiresAt && session.membership.expiresAt <= Date.now()) return "FREE";
      return session.membership.tier;
    }
    function qualities() {
      const level = tier();
      return level === "SVIP" ? Object.keys(qualityLevels) : level === "VIP" ? ["128k", "192k", "320k", "flac", "hires"] : ["128k"];
    }
    function publicState() {
      const level = tier();
      return {
        loggedIn: !!session,
        providerId,
        qualities: qualities(),
        ...session ? {
          displayName: session.profile.nickname,
          avatarUrl: session.profile.avatarUrl,
          ...level !== "FREE" ? {
            badge: {
              text: level,
              color: level === "SVIP" ? "#9b6b1c" : "#c73548"
            }
          } : {},
          details: [
            { label: "网易云 ID", value: str(session.profile.userId) },
            {
              label: "账号权益",
              value: level === "FREE" ? "普通用户 · 标准音质" : level + " · 具体歌曲以平台授权为准"
            },
            ...session.membership.expiresAt ? [
              {
                label: "会员到期",
                value: new Date(session.membership.expiresAt).toLocaleDateString()
              }
            ] : []
          ]
        } : {}
      };
    }
    async function loadProfile(credential, op) {
      const response = await client.request("/api/w/nuser/account/get", {}, op, credential);
      const profile = response.profile || response.data?.profile;
      if (!profile?.userId) throw failure("未能读取网易云账号资料", "NETWORK_ERROR");
      const vip = await client.request("/api/music-vip-membership/client/vip/info", { userId: str(profile.userId) }, op, credential).catch((error) => {
        if (error.code === "AUTH_REQUIRED" || op.signal.aborted) throw error;
        return null;
      });
      return {
        credential,
        profile: {
          userId: str(profile.userId),
          nickname: str(profile.nickname),
          avatarUrl: str(profile.avatarUrl),
          vipType: Number(profile.vipType) || 0
        },
        membership: membership(profile, vip)
      };
    }
    async function publishAccount() {
      const account = publicState();
      await Promise.all([
        ctx.entries.invalidate(),
        ...["account", "daily", "library"].map((id) => ctx.ui.setState(id, { account }))
      ]);
    }
    async function ensureAccount(op) {
      op.signal.throwIfAborted();
      const before = generation;
      const current = await ctx.accounts.current(accountId);
      const next = current && !current.expired ? current.connectionId : null;
      if (before !== generation && next !== connectionId) throw failure("账号已切换，请重试");
      if (next !== connectionId) resetAccount(next);
      if (!next || op.connectionId && op.connectionId !== next) throw failure("当前网易云账号不可用");
      const token = generation;
      const handle = await ctx.credentials.get(next);
      assertGeneration(token);
      if (!handle || handle.id === invalidCredential) throw failure("当前网易云账号需要重新登录");
      if (session && session.credential.id !== handle.id) resetAccount(next);
      if (session && Date.now() - refreshedAt < 5 * 6e4) return session;
      if (!refreshing) {
        const epoch = generation;
        const task = loadProfile(handle, { ...operation(), userIntent: op.userIntent }).then((value) => {
          assertGeneration(epoch);
          session = value;
          refreshedAt = Date.now();
          return value;
        }).catch(async (error) => {
          if (epoch === generation && error.code === "AUTH_REQUIRED") {
            await rejectSession(epoch, next, handle);
          }
          throw error;
        }).finally(() => {
          if (refreshing === task) refreshing = void 0;
        });
        refreshing = task;
      }
      const account = await refreshing;
      op.signal.throwIfAborted();
      if (session !== account) throw failure("账号已切换，请重试");
      return account;
    }
    ctx.effects.add(ctx.accounts.register(accountId, createHostAccount(client, loadProfile)));
    const onAccount = (event) => {
      if (event.accountId !== accountId) return;
      resetAccount(null);
      void publishAccount().catch(() => {
      });
    };
    ctx.effects.add(ctx.events.on("account.changed", onAccount));
    ctx.effects.add(ctx.events.on("account.expired", onAccount));
    function register(id, handler) {
      ctx.effects.add(ctx.actions.register(id, handler));
    }
    register("daily.eligible", async (input, op) => {
      if (input?.selectedSource !== providerId) return false;
      for (const key of ["netease.network", "netease.credential"]) {
        if ((await ctx.permissions.query({ key })).status !== "granted") return false;
      }
      try {
        await ensureAccount(op);
        return !!session;
      } catch {
        return false;
      }
    });
    register("open", () => ctx.ui.openView("account"));
    register("daily.open", () => ctx.ui.openView("daily"));
    register("library.open", () => ctx.ui.navigation.open({ page: "playlist", sectionId: "library" }));
    register("playlist.import.open", () => ctx.ui.playlistImport.open({
      importerId: "netease-playlist",
      title: "导入网易云歌单"
    }));
    register("render.account", defineNativeView(async (_input, op) => {
      const current = await ctx.accounts.current(accountId);
      let description = current?.expired ? "登录已过期，请从顶部账号菜单重新扫码登录" : "未登录，请从顶部账号菜单选择「网易云账号」扫码登录";
      if (current && !current.expired) {
        try {
          await ensureAccount(op);
          description = `${session.profile.nickname} · ${tier()}`;
        } catch {
          description = "当前账号暂不可用";
        }
      }
      return { type: "page", title: "网易云账号", description, sections: [] };
    }));
    function track(song) {
      const files = {
        "128k": song.l || song.lMusic,
        "192k": song.m || song.mMusic,
        "320k": song.h || song.hMusic,
        flac: song.sq,
        hires: song.hr,
        atmos: song.je,
        atmos_plus: song.sk,
        master: song.jm
      };
      const available = Object.keys(files).filter((quality) => files[quality] != null);
      const qualitySizes = Object.fromEntries(available.flatMap((quality) => {
        const bytes = Number(files[quality].size);
        return Number.isSafeInteger(bytes) && bytes > 0 ? [[quality, bytes]] : [];
      }));
      return {
        ref: ref("track", song.id),
        title: str(song.name),
        subtitle: asArray(song.ar || song.artists).map((a) => a.name).join("、"),
        durationMs: positive(song.dt || song.duration),
        playable: true,
        capabilities: ["music.resolve@1", "music.lyrics@1"],
        metadata: {
          artists: asArray(song.ar || song.artists).map((a) => str(a.name)),
          album: {
            id: str(song.al?.id || song.album?.id),
            title: str(song.al?.name || song.album?.name)
          },
          durationMs: positive(song.dt || song.duration),
          artworkUrl: str(song.al?.picUrl || song.album?.picUrl),
          qualities: available.length ? available : ["128k"],
          qualitySizes
        }
      };
    }
    function highResolutionArtwork(request) {
      const candidates = [
        request?.artworkUrl,
        request?.song?.img,
        request?.song?.metadata?.artworkUrl,
        request?.song?.al?.picUrl
      ];
      for (const candidate of candidates) {
        if (typeof candidate !== "string") continue;
        try {
          const url = new URL(candidate);
          const hostname = url.hostname.toLowerCase();
          if (!["http:", "https:"].includes(url.protocol) || hostname !== "music.126.net" && !hostname.endsWith(".music.126.net")) continue;
          const requested = Number.isSafeInteger(request?.targetSize) ? Math.max(1024, Math.min(2048, request.targetSize)) : 1024;
          const current = /^([1-9]\d*)[xy]([1-9]\d*)$/i.exec(url.searchParams.get("param") || "");
          const size = Math.max(requested, current ? Number(current[1]) : 0, current ? Number(current[2]) : 0);
          url.searchParams.set("param", `${size}y${size}`);
          return url.href;
        } catch {
        }
      }
      return void 0;
    }
    async function tracksWithQualities(songs, op) {
      const token = generation;
      const items = asArray(songs), result = new Array(items.length);
      let index = 0;
      await Promise.all(Array.from({ length: Math.min(6, items.length) }, async () => {
        while (index < items.length) {
          const position = index++, song = items[position], id = str(song.id);
          op.signal.throwIfAborted();
          let details = qualityCache.get(id);
          if (!details || details.expiresAt < Date.now()) {
            try {
              const response = await ctx.http.request({
                url: "https://music.163.com/api/song/music/detail/get?songId=" + encodeURIComponent(id),
                method: "GET",
                permissionKey: "netease.network",
                operation: op,
                timeoutMs: 5e3,
                headers: { Referer: "https://music.163.com/" }
              });
              const body = typeof response.body === "string" ? JSON.parse(response.body) : response.body;
              if (response.status !== 200 || body?.code !== 200 || !body.data)
                throw failure("音质详情暂不可用", "NETWORK_ERROR");
              const files = Object.fromEntries(["l", "m", "h", "sq", "hr", "je", "sk", "jm"].filter((key) => Object.hasOwn(body.data, key)).map((key) => [key, body.data[key]]));
              details = { files, expiresAt: Date.now() + 5 * 60 * 1e3 };
              qualityCache.set(id, details);
              if (qualityCache.size > 2e3) qualityCache.delete(qualityCache.keys().next().value);
            } catch {
              op.signal.throwIfAborted();
              details = void 0;
            }
          }
          assertGeneration(token);
          result[position] = track({ ...song, ...details?.files });
        }
      }));
      return result;
    }
    function playlist(item) {
      return {
        ref: ref("playlist", item.id),
        title: str(item.name),
        subtitle: str(item.creator?.nickname || item.copywriter),
        capabilities: ["music.playlist.tracks@1"],
        playlist: {
          trackCount: positive(item.trackCount),
          artworkUrl: str(item.picUrl || item.coverImgUrl),
          author: str(item.creator?.nickname),
          description: str(item.description)
        }
      };
    }
    async function daily(_input, op) {
      await ensureAccount(op);
      const key = session.profile.userId + ":" + (/* @__PURE__ */ new Date()).toLocaleDateString();
      if (cache.has(key)) return cache.get(key);
      const token = generation;
      const [songs, lists] = await Promise.all([
        api("/api/v3/discovery/recommend/songs", {}, op),
        api("/api/v1/discovery/recommend/resource", {}, op)
      ]);
      if (token !== generation) throw failure("账号已退出");
      const value = {
        items: [],
        sections: [
          {
            id: "songs",
            title: "我的每日推荐",
            items: await tracksWithQualities(songs.data?.dailySongs || songs.recommend, op)
          },
          {
            id: "playlists",
            title: "每日推荐歌单",
            items: asArray(lists.recommend).map(playlist)
          }
        ]
      };
      assertGeneration(token);
      cache.set(key, value);
      return value;
    }
    async function library(input, op) {
      const account = await ensureAccount(op);
      const token = generation;
      const offset = Number(input?.cursor || 0);
      if (!Number.isSafeInteger(offset) || offset < 0 || offset > 1e6)
        throw failure("分页参数无效", "INVALID_INPUT");
      const result = await api(
        "/api/user/playlist",
        { uid: account.profile.userId, limit: 30, offset, includeVideo: false },
        op
      );
      if (token !== generation) throw failure("账号已退出");
      const items = asArray(result.playlist).map(playlist);
      return {
        items,
        ...result.more && items.length ? { nextCursor: str(offset + items.length) } : {}
      };
    }
    async function playlistTracks(resource, cursor, op) {
      await ensureAccount(op);
      if (resource.connectionId && resource.connectionId !== connectionId) throw failure("账号已切换，请重试");
      let id = str(resource.id).trim();
      if (/https?:/.test(id))
        id = /[?&]id=(\d+)/.exec(id)?.[1] || /playlist\/(\d+)/.exec(id)?.[1] || "";
      if (!/^\d+$/.test(id)) throw failure("请输入正确的网易云歌单 ID", "INVALID_INPUT");
      const page = pageNumber(cursor), offset = (page - 1) * 100;
      const detail = await api("/api/v6/playlist/detail", { id, n: 1e5, s: 0 }, op);
      const list = detail.playlist;
      if (!list) throw failure("歌单不存在或当前账号无权访问", "NETWORK_ERROR");
      const ids = asArray(list.trackIds).slice(offset, offset + 100).map((item) => ({ id: item.id }));
      const songs = ids.length ? await api("/api/v3/song/detail", { c: JSON.stringify(ids) }, op) : { songs: [] };
      return {
        items: await tracksWithQualities(songs.songs, op),
        name: str(list.name),
        playlist: playlist(list).playlist,
        totalEstimate: asArray(list.trackIds).length,
        ...offset + ids.length < asArray(list.trackIds).length ? { nextCursor: str(page + 1) } : {}
      };
    }
    function playlistCategory(name, id = name, group = "分类") {
      return {
        ref: ref("playlist-category", encodeURIComponent(id)),
        title: name,
        subtitle: group,
        capabilities: []
      };
    }
    function publicPlaylist(item) {
      return {
        ...playlist(item),
        subtitle: str(item.creator?.nickname || item.copywriter),
        playlist: {
          trackCount: positive(item.trackCount),
          artworkUrl: str(item.picUrl || item.coverImgUrl),
          author: str(item.creator?.nickname),
          description: str(item.description)
        }
      };
    }
    register("daily", daily);
    register("library", library);
    const loginView = (title) => ({
      type: "page",
      title,
      description: "登录网易云账号后，在这里查看你的音乐。",
      actions: [{ label: "登录网易云", action: "open", primary: true }],
      sections: []
    });
    const playlistSection = (id, title, items) => ({
      id,
      title,
      layout: "grid",
      items,
      onOpen: "playlist.open",
      itemActions: [{ label: "导入歌单", action: "playlist.import" }]
    });
    register("daily.refresh", () => {
      cache.clear();
      return null;
    });
    register("library.refresh", () => {
      libraryPages.clear();
      libraryPage = 1;
      return null;
    });
    register("library.page", (input) => {
      libraryPage = pageNumber(input?.page);
      return null;
    });
    register(
      "render.daily",
      defineNativeView(async (_input, op) => {
        let content;
        try {
          content = await daily({}, op);
        } catch (error) {
          if (!session && error.code === "AUTH_REQUIRED") return loginView("网易云推荐");
          throw error;
        }
        const songs = content.sections.find((item) => item.id === "songs")?.items || [];
        const lists = content.sections.find((item) => item.id === "playlists")?.items || [];
        return {
          type: "page",
          title: "网易云推荐",
          description: `为 ${session.profile.nickname} 推荐`,
          actions: [
            ...songs.length ? [
              {
                label: "播放全部",
                action: "play",
                input: { refs: songs.map((item) => item.ref) },
                primary: true
              }
            ] : [],
            { label: "刷新", action: "daily.refresh" }
          ],
          sections: [
            playlistSection("playlists", "推荐歌单", lists),
            { id: "songs", title: "每日推荐歌曲", layout: "list", items: songs, onPlay: "play" }
          ]
        };
      })
    );
    register(
      "render.library",
      defineNativeView(async (_input, op) => {
        try {
          await ensureAccount(op);
        } catch (error) {
          if (error.code === "AUTH_REQUIRED") return loginView("我的网易云歌单");
          throw error;
        }
        const page = libraryPage;
        let content = libraryPages.get(page);
        try {
          if (!content) {
            content = await library({ cursor: str((page - 1) * 30) }, op);
            libraryPages.set(page, content);
          }
        } catch (error) {
          if (!session && error.code === "AUTH_REQUIRED") return loginView("我的网易云歌单");
          throw error;
        }
        return {
          type: "page",
          title: "我的网易云歌单",
          description: `创建和收藏的歌单 · 第 ${page} 页`,
          actions: [
            { label: "刷新", action: "library.refresh" },
            ...page > 1 ? [{ label: "上一页", action: "library.page", input: { page: page - 1 } }] : [],
            ...content.nextCursor ? [{ label: "下一页", action: "library.page", input: { page: page + 1 } }] : []
          ],
          sections: [playlistSection("playlists", void 0, content.items)]
        };
      })
    );
    function ownedResource(resource, kind) {
      if (!resource || resource.pluginId !== ctx.plugin.id || resource.providerId !== providerId || resource.kind !== kind || resource.connectionId !== void 0 && resource.connectionId !== connectionId)
        throw failure("资源不属于此网易云插件", "INVALID_INPUT");
      const id = str(resource.id);
      if (!/^\d+$/.test(id)) throw failure("资源 ID 无效", "INVALID_INPUT");
      return ref(kind, id);
    }
    function playlistId(input) {
      const id = input?.ref ? ownedResource(input.ref, "playlist").id : str(input?.id);
      if (!/^\d+$/.test(id)) throw failure("歌单 ID 无效", "INVALID_INPUT");
      return id;
    }
    register("playlist.open", async (input) => {
      const id = playlistId(input);
      await ctx.ui.navigation.open({ page: "playlist", ref: ref("playlist", id) });
      return null;
    });
    register("playlist.import", async (input) => {
      const id = playlistId(input);
      await ctx.ui.playlistImport.open({
        importerId: "netease-playlist",
        initialValue: id,
        title: "导入网易云歌单"
      });
      return null;
    });
    register("play", async (input, op) => {
      await ensureAccount(op);
      const resources = input?.refs || (input?.ref ? [input.ref] : null);
      const ids = resources ? asArray(resources).map((resource) => ownedResource(resource, "track").id) : asArray(input?.ids).map(str);
      if (!ids.length || ids.length > 100 || ids.some((id) => !/^\d+$/.test(id)))
        throw failure("请选择有效的歌曲", "INVALID_INPUT");
      const selectedId = input?.ref ? ownedResource(input.ref, "track").id : ids[0];
      if (!ids.includes(selectedId)) throw failure("所选歌曲不在播放队列中", "INVALID_INPUT");
      let grant = await ctx.permissions.query({ key: "playback" });
      if (grant.status !== "granted")
        grant = await ctx.permissions.request({ key: "playback", intent: op.userIntent });
      if (grant.status !== "granted") throw failure("请允许插件控制播放", "PERMISSION_DENIED");
      const result = await api(
        "/api/v3/song/detail",
        { c: JSON.stringify([...new Set(ids)].map((id) => ({ id }))) },
        op
      );
      const songs = new Map((await tracksWithQualities(result.songs, op)).map((song) => [song.ref.id, song]));
      const items = [...new Set(ids)].map((id) => songs.get(id)).filter(Boolean);
      if (!items.length) throw failure("没有可播放的歌曲", "NOT_FOUND");
      const selected = items.find((item) => item.ref.id === selectedId);
      if (!selected) throw failure("所选歌曲暂不可播放", "NOT_FOUND");
      const call = { permissionKey: "playback", operation: op };
      await ctx.queue.replace(items, call);
      await ctx.player.play(selected.ref, call);
      return null;
    });
    ctx.effects.add(
      ctx.providers.register(providerId, {
        tracks: {
          artworkHires(_resource, request) {
            return Promise.resolve(highResolutionArtwork(request));
          },
          async suggest(query, op) {
            const result = await api("/api/search/suggest/web", { s: query }, op);
            const data = result.result || {};
            const categories = ["songs", "artists", "albums", "playlists"];
            const order = Array.isArray(data.order) ? data.order.filter((category) => categories.includes(category)) : categories.filter((category) => asArray(data[category]).length);
            return {
              order,
              ...Object.fromEntries(categories.map((category) => [category, asArray(data[category]).slice(0, 8)]))
            };
          },
          async hotSearch(op) {
            const result = await api("/api/search/hot/detail", {}, op);
            return asArray(result.data || result.result?.hots).map((item) => str(item.searchWord || item.first)).filter(Boolean);
          },
          async search(request, op) {
            const page = pageNumber(request.cursor), size = Math.max(1, Math.min(100, Math.floor(Number(request.limit) || 30)));
            const offset = (page - 1) * size;
            const result = await api(
              "/api/cloudsearch/pc",
              { s: request.query, type: 1, limit: size, offset, total: true },
              op
            );
            const items = await tracksWithQualities(result.result?.songs, op), total = positive(result.result?.songCount);
            return {
              items,
              totalEstimate: total,
              ...items.length && offset + items.length < total ? { nextCursor: str(page + 1) } : {}
            };
          },
          async resolve(resource, quality, op) {
            try {
              await ensureAccount(op);
              if (resource.connectionId && resource.connectionId !== connectionId) throw failure("账号已切换，请重试");
              quality = legacyQualityIds[quality] || quality;
              quality ||= qualities()[0];
              if (!qualities().includes(quality))
                throw failure("当前网易云账号不支持该音质，请选择可用音质", "UNSUPPORTED");
              const id = str(resource.id);
              if (!/^\d+$/.test(id)) throw failure("歌曲 ID 无效", "INVALID_INPUT");
              const detail = await api(
                "/api/v3/song/detail",
                { c: JSON.stringify([{ id: Number(id) }]) },
                op
              );
              const privilege = asArray(detail.privileges)[0] || {};
              const song = asArray(detail.songs)[0];
              if (!song) throw failure("歌曲不存在", "NOT_FOUND");
              if (Number(privilege.fee ?? song.fee) === 1 && tier() === "FREE")
                throw failure("此歌曲需要网易云会员，当前账号无完整播放权限");
              if (Number(privilege.st) < 0 || privilege.pl !== void 0 && Number(privilege.pl) <= 0)
                throw failure("当前账号没有此歌曲的播放权限");
              const result = await api(
                "/api/song/enhance/player/url/v1",
                {
                  ids: JSON.stringify([Number(id)]),
                  level: qualityLevels[quality],
                  encodeType: "flac"
                },
                op
              );
              const media = asArray(result.data)[0];
              if (media?.freeTrialInfo || media?.code !== void 0 && Number(media.code) !== 200)
                throw failure("当前账号仅获试听或无播放权限，请在网易云确认歌曲购买与会员权益");
              if (typeof media?.url !== "string" || !/^https?:\/\//.test(media.url))
                throw failure("当前账号无法播放此歌曲，可能缺少购买权限或地区授权");
              if (media.level && media.level !== qualityLevels[quality])
                await ctx.ui.toast({
                  level: "info",
                  message: "网易云返回了账号实际可用的音质"
                });
              return { ok: true, url: media.url };
            } catch (error) {
              return ctx.playback.failure({
                code: [
                  "NETWORK_ERROR",
                  "AUTH_REQUIRED",
                  "PERMISSION_DENIED",
                  "NOT_FOUND",
                  "UNSUPPORTED",
                  "CANCELLED"
                ].includes(error.code) ? error.code : "INTERNAL",
                message: error.message,
                recovery: { mode: "stop-current" }
              });
            }
          },
          async lyrics(resource, op) {
            const result = await api(
              "/api/song/lyric",
              { id: resource.id, lv: -1, tv: -1, rv: -1, kv: -1 },
              op
            );
            const parse = (text2) => {
              const lines2 = [];
              for (const line of str(text2).split(/\r?\n/)) {
                const tags = [...line.matchAll(/\[(\d+):(\d+)(?:[:.](\d+))?\]/g)];
                const content = line.replace(/\[[^\]]+\]/g, "").trim();
                for (const tag of tags)
                  lines2.push({
                    startTimeMs: Math.round((Number(tag[1]) * 60 + Number(tag[2]) + (tag[3] ? Number(tag[3]) / Math.pow(10, tag[3].length) : 0)) * 1e3),
                    text: content
                  });
              }
              return lines2.sort((a, b) => a.startTimeMs - b.startTimeMs);
            };
            const translations = new Map(
              parse(result.tlyric?.lyric).map((line) => [line.startTimeMs, line.text])
            );
            const lines = parse(result.lrc?.lyric).map((line) => ({
              ...line,
              ...translations.has(line.startTimeMs) ? { translation: translations.get(line.startTimeMs) } : {}
            }));
            return {
              format: "crlyric",
              version: 1,
              track: resource,
              offsetMs: 0,
              lines,
              ...!lines.length && result.lrc?.lyric ? { plainText: result.lrc.lyric } : {}
            };
          }
        },
        playlists: {
          async search(request, op) {
            const page = pageNumber(request.cursor);
            const size = Math.max(1, Math.min(100, Math.floor(Number(request.limit) || 30)));
            const offset = (page - 1) * size;
            const result = await api("/api/cloudsearch/pc", {
              s: request.query,
              type: 1e3,
              limit: size,
              offset,
              total: true
            }, op);
            const items = asArray(result.result?.playlists).map(publicPlaylist);
            const total = positive(result.result?.playlistCount);
            return {
              items,
              totalEstimate: total,
              ...items.length && offset + items.length < total ? { nextCursor: str(page + 1) } : {}
            };
          },
          async categories(op) {
            const [catalogue, hot] = await Promise.all([
              api("/api/playlist/catalogue", {}, op),
              api("/api/playlist/hottags", {}, op)
            ]);
            const groupNames = catalogue.categories || {};
            const popular = asArray(hot.tags).map((item) => str(item.name)).filter(Boolean);
            const categories = asArray(catalogue.sub).flatMap((item) => {
              const name = str(item.name);
              if (!name) return [];
              const group = str(groupNames[item.category]) || "分类";
              return [playlistCategory(name, name, group)];
            });
            return {
              items: [
                playlistCategory("全部", "全部", "热门"),
                ...[...new Set(popular)].map((name) => playlistCategory(name, name, "热门")),
                ...categories.filter((item) => !popular.includes(item.title))
              ]
            };
          },
          async list(category, cursor, op) {
            const page = pageNumber(cursor);
            const size = 30;
            const offset = (page - 1) * size;
            const cat = category?.kind === "playlist-category" ? decodeURIComponent(str(category.id)) : "全部";
            const result = await api("/api/playlist/list", {
              cat,
              order: "hot",
              limit: size,
              offset,
              total: true
            }, op);
            const items = asArray(result.playlists).map(publicPlaylist);
            const total = positive(result.total);
            return {
              items,
              totalEstimate: total,
              ...items.length && offset + items.length < total ? { nextCursor: str(page + 1) } : {}
            };
          },
          get: playlistTracks
        },
        charts: {
          async list(op) {
            const result = await api("/api/toplist", {}, op);
            return {
              items: asArray(result.list).map((item) => ({
                ref: ref("chart", item.id),
                title: str(item.name),
                subtitle: str(item.updateFrequency),
                capabilities: ["music.charts.getTracks@1"],
                chart: {
                  updateFrequency: str(item.updateFrequency),
                  artworkUrl: str(item.coverImgUrl)
                }
              }))
            };
          },
          async getTracks(resource, cursor, op) {
            const chart = ownedResource(resource, "chart");
            return playlistTracks({ ...chart, kind: "playlist" }, cursor, op);
          }
        }
      })
    );
    ctx.effects.add(
      ctx.playlistImporters.register("netease-playlist", {
        getTracks: (input, op) => playlistTracks(ref("playlist", input.value), input.cursor, op)
      })
    );
    ctx.effects.add(() => {
      generation++;
      connectionId = null;
      session = null;
      cache.clear();
      libraryPages.clear();
      qualityCache.clear();
    });
  });
  return __toCommonJS(index_exports);
})();

if (typeof __ceru_entry.default !== "function") throw new Error("Entry must default-export a function");
return __ceru_entry.default(ctx);
};

// Embedded static resources
const resources = {"third-party-notices":{"type":"text","value":"# Third-party notices\n\nThe single-file plugin includes code from or based on the following MIT-licensed projects. The shared MIT permission and warranty text below applies to each copyright notice.\n\n- NeteaseCloudMusicApiEnhanced / NeteaseCloudMusicApi: Copyright (c) 2013-2022 Binaryify. Protocol request formatting and endpoint references were adapted from https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced (util/crypto.js, module/login_qr_key.js, module/login_qr_check.js, module/login_status.js, module/vip_info.js). Upstream license: https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced/blob/master/LICENSE (verified 2026-09-20). The plugin uses the host-provided crypto API for encryption; the upstream API server is not bundled.\n- Vue 3.5.43: Copyright (c) 2018-present, Yuxi (Evan) You. https://github.com/vuejs/core\n- qrcode 1.5.4: Copyright (c) 2012 Ryan Day. https://github.com/soldair/node-qrcode\n- dijkstrajs (qrcode dependency): Copyright (C) 2008 Wyatt Baldwin <self@wyattbaldwin.com>. All rights reserved. Dijkstra path-finding functions adapted from the Dijkstar Python project. https://github.com/andrewhayward/dijkstrajs\n- Ceru plugin SDK 0.3.1: Copyright (c) 2026 Ceru Music contributors. https://github.com/CeruMusic/CeruMusic-Plugin-Cli\n\n## MIT License\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in\nall copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\nTHE SOFTWARE.\n","mime":"text/plain"}};

// Public plugin exports

exports.activate = LogicMain;

exports.resources = resources;
