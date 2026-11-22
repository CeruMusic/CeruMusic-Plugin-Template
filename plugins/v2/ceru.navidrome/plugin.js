exports.manifest = {
  manifestVersion: 2,
  id: 'ceru.navidrome',
  name: 'Navidrome',
  version: '1.1.1',
  description: '将自己的 Navidrome 音乐库接入澜音搜索、歌单、播放与歌词',
  author: 'CeruMusic',
  license: 'MIT',
  homepage: 'https://github.com/CeruMusic/CeruMusic-Plugin-Template',
  engines: { hostApi: '^2.0.0', logicRuntime: 'ceru-js@1', uiSchema: '^1.0.0' },
  modules: {
    logic: { entry: 'logic.main' },
    surfaces: [{ id: 'connection', kind: 'schema', entry: 'schema.connection' }],
  },
  contributes: {
    providers: [
      {
        id: 'navidrome',
        name: 'Navidrome',
        protocols: ['music.search@1', 'music.resolve@1', 'music.lyrics@1', 'music.playlists@1'],
        qualities: ['128k', '192k', '320k', 'original'],
        icon: { kind: 'host', name: 'server' },
        connectionMode: 'single',
      },
    ],
    homeSections: [
      {
        id: 'navidrome-library',
        title: '音乐库',
        kind: 'playlists',
        providerIds: ['navidrome'],
        icon: { kind: 'host', name: 'library' },
      },
    ],
    commands: [
      { id: 'connection', title: '连接 Navidrome', action: 'connection.open', view: 'connection' },
      { id: 'status', title: '测试连接', action: 'source.status' },
      { id: 'refresh', title: '刷新音乐库', action: 'library.refresh' },
      { id: 'import', title: '导入 Navidrome 歌单', action: 'playlist.import' },
    ],
    playlistImporters: [
      {
        id: 'navidrome-playlist',
        providerId: 'navidrome',
        title: 'Navidrome',
        description: '从已连接的 Navidrome 服务器导入歌单',
        placeholder: '歌单 ID 或 Navidrome 歌单页面地址',
      },
    ],
    lyricConverters: [{ id: 'navidrome-lyrics', title: 'Navidrome 歌词导出', formats: ['plain'] }],
  },
  permissions: [
    { key: 'navidrome.http', name: 'network.request', reason: '访问你设置的 Navidrome 服务器' },
    {
      key: 'navidrome.lan',
      name: 'network.private',
      optional: true,
      reason: '连接本机或局域网内的音乐服务器',
    },
  ],
  dataSchemas: { config: 1, state: 1 },
}

exports.activate = async function (ctx) {
  const crypto = require('@ceru/crypto')
  const providerId = 'navidrome'
  const storageKey = 'connection.v1'
  const qualities = ['128k', '192k', '320k', 'original']
  const categories = [
    ['hot', '我的歌单'],
    ['newest', '最近添加的专辑'],
    ['recent', '最近播放的专辑'],
    ['frequent', '常听专辑'],
    ['alphabeticalByName', '全部专辑'],
    ['starred', '收藏'],
  ]
  const cache = new Map()
  let connection = null
  let changing = false
  let status = '尚未连接'
  const array = (value) => (Array.isArray(value) ? value : value ? [value] : [])
  const str = (value, fallback = '') => (value == null ? fallback : String(value))
  const integer = (value, fallback = 0) =>
    Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : fallback
  const hash = (value) => crypto.createHash('sha256').update(value).digest('hex').slice(0, 24)
  function fault(code, message) {
    return Object.assign(new Error(message), { code })
  }
  function normalizeServer(value) {
    let url
    try {
      url = new URL(str(value).trim())
    } catch {
      throw fault('INVALID_INPUT', '请输入完整服务器地址，包含 http:// 或 https://')
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search) {
      throw fault('INVALID_INPUT', '服务器地址只支持 HTTP(S)，不能包含账号、密码或查询参数')
    }
    const path = url.pathname.replace(/\/+$/, '').replace(/\/rest(?:\/ping(?:\.view)?)?$/, '')
    // The Host's sandbox URL exposes read-only path/hash properties.
    return url.origin + path
  }
  function identity(serverUrl, username) {
    return hash(JSON.stringify([serverUrl, username]))
  }
  function current() {
    if (!connection) throw fault('AUTH_REQUIRED', '请先在 Navidrome 连接设置中登录')
    return connection
  }
  function checkOperation(operation) {
    if (
      operation?.signal?.aborted ||
      (operation?.deadlineAt && operation.deadlineAt <= Date.now())
    ) {
      throw fault('CANCELLED', '操作已取消，请重试')
    }
  }
  function signedUrl(account, endpoint, params = {}) {
    const url = new URL(account.serverUrl + '/rest/' + endpoint + '.view')
    const query = {
      u: account.username,
      t: account.token,
      s: account.salt,
      v: '1.16.1',
      c: 'CeruMusic',
      f: 'json',
      ...params,
    }
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
    }
    return url.href
  }
  async function authorize(account, operation) {
    checkOperation(operation)
    const keys = account.allowLocal ? ['navidrome.http', 'navidrome.lan'] : ['navidrome.http']
    for (const key of keys) {
      let result = await ctx.permissions.query({ key })
      if (result.status === 'prompt')
        result = await ctx.permissions.request({ key, intent: operation?.userIntent })
      if (result.status !== 'granted')
        throw fault(
          'PERMISSION_DENIED',
          '请在插件权限中允许' + (key.endsWith('lan') ? '局域网访问' : '网络访问'),
        )
    }
  }
  async function api(account, endpoint, params, operation) {
    await authorize(account, operation)
    checkOperation(operation)
    let result
    try {
      result = await ctx.http.request({
        permissionKey: 'navidrome.http',
        url: signedUrl(account, endpoint, params),
        method: 'GET',
        timeoutMs: 15000,
        operation,
      })
    } catch {
      checkOperation(operation)
      throw fault('NETWORK_ERROR', '无法连接服务器，请检查地址、证书、网络与局域网权限')
    }
    checkOperation(operation)
    if (result.status === 401 || result.status === 403)
      throw fault('AUTH_REQUIRED', '服务器拒绝登录，请检查用户名、密码或反向代理配置')
    if (result.status === 404)
      throw fault('NOT_FOUND', '接口不存在，请检查服务器地址及反向代理子路径')
    if (result.status === 429) throw fault('RATE_LIMITED', '服务器请求过于频繁，请稍后重试')
    if (result.status < 200 || result.status >= 300)
      throw fault('NETWORK_ERROR', '服务器返回 HTTP ' + result.status)
    let body = result.body
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body)
      } catch {
        throw fault('NETWORK_ERROR', '服务器未返回 JSON，请检查地址是否指向 Navidrome')
      }
    }
    const response = body?.['subsonic-response']
    if (!response || !['ok', 'failed'].includes(response.status))
      throw fault('NETWORK_ERROR', '服务器返回的 Subsonic 响应无效')
    if (response.status === 'failed') {
      const code = Number(response.error?.code)
      if ([40, 41, 42, 43, 44].includes(code))
        throw fault('AUTH_REQUIRED', '登录失效或认证方式不受支持，请重新连接')
      if (code === 50) throw fault('PERMISSION_DENIED', '服务器账号没有执行此操作的权限')
      if ([20, 30, 70].includes(code)) throw fault('UNSUPPORTED', '服务器不支持此接口')
      if (code === 60) throw fault('NOT_FOUND', '内容已被移除或对当前账号不可见')
      throw fault('NETWORK_ERROR', '服务器处理请求失败（Subsonic ' + (code || 0) + '）')
    }
    return response
  }
  async function request(account, endpoint, params, operation, cached = false) {
    checkOperation(operation)
    const key = JSON.stringify([account.id, endpoint, params])
    const stored = cache.get(key)
    let response
    if (cached && stored && stored.until > Date.now()) {
      await authorize(account, operation)
      response = stored.value
    } else {
      response = await api(account, endpoint, params, operation)
      if (account !== connection) throw fault('CANCELLED', '连接已变更，请重新打开音乐库')
      if (cached) {
        if (cache.size >= 24) cache.delete(cache.keys().next().value)
        cache.set(key, { value: response, until: Date.now() + 60000 })
      }
    }
    if (account !== connection) throw fault('CANCELLED', '连接已变更，请重新打开音乐库')
    checkOperation(operation)
    return response
  }
  function ref(account, kind, type, id, data) {
    return {
      pluginId: ctx.plugin.id,
      providerId,
      connectionId: account.id,
      kind,
      // The desktop playlist bridge retains id but may omit connectionId/data.
      id: 'nd:' + account.id + ':' + type + ':' + encodeURIComponent(str(id)),
      ...(data ? { data } : {}),
    }
  }
  function decode(account, resource, allowed) {
    if (resource?.pluginId !== ctx.plugin.id || resource?.providerId !== providerId)
      throw fault('NOT_FOUND', '这不是本插件的音乐资源')
    const match = /^nd:([a-f0-9]{24}):([a-z]+):(.+)$/.exec(str(resource.id))
    if (!match || !allowed.includes(match[2]))
      throw fault('NOT_FOUND', '无效的 Navidrome 资源，请从音乐库重新选择')
    if (
      match[1] !== account.id ||
      (resource.connectionId && resource.connectionId !== account.id)
    ) {
      throw fault('AUTH_REQUIRED', '这首歌或歌单属于另一个服务器或账号，请连接原账号')
    }
    try {
      return { type: match[2], id: decodeURIComponent(match[3]) }
    } catch {
      throw fault('NOT_FOUND', '资源 ID 无效')
    }
  }
  function cover(account, id) {
    return account.showCovers && id ? signedUrl(account, 'getCoverArt', { id, size: 400 }) : ''
  }
  function track(account, song) {
    const artists = array(song.artists)
      .map((artist) => str(artist.name))
      .filter(Boolean)
    if (!artists.length) artists.push(str(song.artist, '未知歌手'))
    return {
      ref: ref(account, 'track', 'song', song.id, {
        title: str(song.title, '未知歌曲'),
        artist: artists.join(' / '),
        coverId: str(song.coverArt),
      }),
      title: str(song.title, str(song.name, '未知歌曲')),
      subtitle: artists.join(' / '),
      playable: true,
      capabilities: ['music.resolve@1', 'music.lyrics@1'],
      metadata: {
        artists,
        album: { id: str(song.albumId), title: str(song.album) },
        durationMs: integer(Number(song.duration) * 1000),
        qualities: account.quality === 'original' ? ['original'] : [account.quality, 'original'],
        artworkUrl: cover(account, song.coverArt),
      },
    }
  }
  function playlist(account, item, type = 'playlist') {
    return {
      ref: ref(account, 'playlist', type, item.id),
      title: str(item.name, str(item.title, '未命名')),
      subtitle: str(item.artist, str(item.owner)),
      capabilities: ['music.playlists@1'],
      playlist: {
        trackCount: integer(item.songCount),
        author: str(item.artist, str(item.owner)),
        description: str(item.comment),
        artworkUrl: cover(account, item.coverArt),
      },
    }
  }
  function paging(cursor, requested = 30) {
    const size = Math.max(1, Math.min(integer(requested, 30), 200))
    if (cursor != null && cursor !== '' && !/^[1-9]\d{0,6}$/.test(String(cursor)))
      throw fault('INVALID_INPUT', '分页参数无效')
    const page = Number(cursor || 1)
    return { page, size, offset: (page - 1) * size }
  }
  function pageOf(items, paging) {
    return {
      items: items.slice(paging.offset, paging.offset + paging.size),
      totalEstimate: items.length,
      ...(paging.offset + paging.size < items.length
        ? { nextCursor: String(paging.page + 1) }
        : {}),
    }
  }
  async function playlists(account, operation) {
    const result = await request(account, 'getPlaylists', {}, operation, true)
    return array(result.playlists?.playlist)
  }
  async function getPlaylist(resource, cursor, operation, limit = 200) {
    const account = current()
    const decoded = decode(account, resource, ['playlist', 'album', 'starred'])
    let name, meta, songs
    if (decoded.type === 'starred') {
      const result = await request(account, 'getStarred2', {}, operation, true)
      songs = array(result.starred2?.song)
      name = '我收藏的歌曲'
      meta = { trackCount: songs.length }
    } else {
      const isAlbum = decoded.type === 'album'
      const result = await request(
        account,
        isAlbum ? 'getAlbum' : 'getPlaylist',
        { id: decoded.id },
        operation,
        true,
      )
      const item = isAlbum ? result.album : result.playlist
      if (!item) throw fault('NOT_FOUND', '歌单或专辑不存在')
      songs = array(isAlbum ? item.song : item.entry)
      name = str(item.name, '未命名')
      meta = playlist(account, item, decoded.type).playlist
    }
    const page = pageOf(
      songs.filter((song) => song?.id != null && !song.isDir && !song.isVideo),
      paging(cursor, limit),
    )
    return { ...page, name, playlist: meta, items: page.items.map((song) => track(account, song)) }
  }
  function publicState() {
    return {
      connected: !!connection,
      status,
      serverUrl: connection?.serverUrl || '',
      username: connection?.username || '',
      quality: connection?.quality || 'original',
      remember: connection?.remember || false,
      allowLocal: connection?.allowLocal ?? true,
      showCovers: connection?.showCovers ?? false,
    }
  }
  async function updateState() {
    await ctx.ui.setState('connection', publicState())
  }
  function register(id, handler) {
    ctx.effects.add(ctx.actions.register(id, handler))
  }
  const saved = await ctx.storage.get(storageKey)
  if (saved && typeof saved === 'object' && saved.remember === true) {
    try {
      const serverUrl = normalizeServer(saved.serverUrl)
      if (
        typeof saved.username !== 'string' ||
        !saved.username ||
        !/^[a-f0-9]{32}$/.test(saved.token) ||
        !/^[a-f0-9]{32}$/.test(saved.salt)
      )
        throw new Error('Invalid stored connection')
      connection = {
        serverUrl,
        username: saved.username,
        token: saved.token,
        salt: saved.salt,
        id: identity(serverUrl, saved.username),
        remember: true,
        quality: qualities.includes(saved.quality) ? saved.quality : 'original',
        allowLocal: saved.allowLocal === true,
        showCovers: saved.showCovers === true,
      }
      status = '已载入连接，等待访问服务器'
    } catch {
      status = '已保存的连接无效，请重新登录'
    }
  }
  async function saveConnection(input, operation) {
    if (changing) throw fault('INVALID_INPUT', '连接正在更新，请稍候')
    changing = true
    try {
      const serverUrl = normalizeServer(input?.serverUrl)
      const username = str(input?.username).trim()
      if (!username) throw fault('INVALID_INPUT', '请输入用户名')
      const id = identity(serverUrl, username)
      let salt, token
      if (typeof input.password === 'string' && input.password.length) {
        salt = crypto.randomBytes(16).toString('hex')
        token = crypto
          .createHash('md5')
          .update(input.password + salt)
          .digest('hex')
      } else if (connection?.id === id) {
        salt = connection.salt
        token = connection.token
      } else throw fault('INVALID_INPUT', '请输入此账号的密码')
      const candidate = {
        id,
        serverUrl,
        username,
        salt,
        token,
        remember: input.remember === true,
        quality: qualities.includes(input.quality) ? input.quality : 'original',
        allowLocal: input.allowLocal === true,
        showCovers: input.showCovers === true,
      }
      const response = await api(candidate, 'ping', {}, operation)
      if (candidate.remember) await ctx.storage.set(storageKey, candidate)
      else await ctx.storage.delete(storageKey)
      connection = candidate
      cache.clear()
      status =
        '已连接' +
        (response.serverVersion
          ? ' · ' + str(response.type, 'Navidrome') + ' ' + str(response.serverVersion)
          : '')
      await updateState()
      return publicState()
    } finally {
      changing = false
    }
  }
  async function disconnect() {
    if (changing) throw fault('INVALID_INPUT', '连接正在更新，请稍候')
    changing = true
    try {
      await ctx.storage.delete(storageKey)
      connection = null
      cache.clear()
      status = '已断开，登录信息已清除'
      await updateState()
      return publicState()
    } finally {
      changing = false
    }
  }
  register('connection.open', (input, operation) => {
    if (input?.mode === 'state') return publicState()
    if (input?.mode === 'save') return saveConnection(input, operation)
    if (input?.mode === 'disconnect') return disconnect()
    return ctx.ui.openView('connection')
  })
  register('source.status', async (_input, operation) => {
    const account = current()
    const response = await request(account, 'ping', {}, operation)
    status = '连接正常' + (response.serverVersion ? ' · ' + str(response.serverVersion) : '')
    await updateState()
    return publicState()
  })
  register('library.refresh', async () => {
    cache.clear()
    await ctx.ui.toast({ level: 'success', message: '音乐库缓存已清除，重新打开列表即可更新' })
  })
  register('playlist.import', () =>
    ctx.ui.playlistImport.open({ importerId: 'navidrome-playlist' }),
  )
  ctx.effects.add(
    ctx.providers.register(providerId, {
      tracks: {
        async search(input, operation) {
          const query = str(input.query).trim()
          if (!query) return { items: [], totalEstimate: 0 }
          const account = current()
          const page = paging(input.cursor, input.limit)
          const response = await request(
            account,
            'search3',
            {
              query,
              artistCount: 0,
              albumCount: 0,
              songCount: page.size + 1,
              songOffset: page.offset,
            },
            operation,
          )
          const songs = array(response.searchResult3?.song)
          const more = songs.length > page.size
          return {
            items: songs.slice(0, page.size).map((song) => track(account, song)),
            totalEstimate: page.offset + songs.length,
            ...(more ? { nextCursor: String(page.page + 1) } : {}),
          }
        },
        async resolve(resource, quality, operation) {
          try {
            const account = current()
            const decoded = decode(account, resource, ['song'])
            await authorize(account, operation)
            checkOperation(operation)
            if (account !== connection) throw fault('CANCELLED', '连接已变更，请重新打开音乐库')
            const selected = qualities.includes(quality) ? quality : account.quality
            const params =
              selected === 'original'
                ? { format: 'raw' }
                : { format: 'mp3', maxBitRate: parseInt(selected, 10) }
            return { ok: true, url: signedUrl(account, 'stream', { id: decoded.id, ...params }) }
          } catch (error) {
            return ctx.playback.failure({
              code: error.code || 'INTERNAL',
              message: error.message,
              retryable: error.code === 'NETWORK_ERROR',
              ...(error.code === 'AUTH_REQUIRED'
                ? {
                    recovery: {
                      mode: 'await-user',
                      actions: [
                        {
                          kind: 'plugin-command',
                          commandId: 'connection',
                          label: '连接 Navidrome',
                        },
                      ],
                    },
                  }
                : {}),
            })
          }
        },
        async lyrics(resource, operation) {
          const document = {
            format: 'crlyric',
            version: 1,
            track: resource,
            offsetMs: 0,
            lines: [],
          }
          const account = current()
          const decoded = decode(account, resource, ['song'])
          try {
            const response = await request(
              account,
              'getLyricsBySongId',
              { id: decoded.id },
              operation,
            )
            const entries = array(response.lyricsList?.structuredLyrics)
            const usable = entries.filter((entry) =>
              array(entry.line).some((line) => typeof line.value === 'string'),
            )
            const chosen =
              usable.find(
                (entry) =>
                  entry.synced === true &&
                  array(entry.line).some((line) => Number.isFinite(line.start) && line.start >= 0),
              ) || usable[0]
            if (chosen) {
              if (chosen.synced === true) {
                document.offsetMs = Number.isFinite(chosen.offset) ? chosen.offset : 0
                document.lines = array(chosen.line)
                  .filter((line) => Number.isFinite(line.start) && line.start >= 0)
                  .map((line) => ({ startTimeMs: line.start, text: str(line.value) }))
                  .sort((a, b) => a.startTimeMs - b.startTimeMs)
              } else
                document.plainText = array(chosen.line)
                  .map((line) => str(line.value))
                  .join('\n')
              return document
            }
          } catch (error) {
            if (!['UNSUPPORTED', 'NOT_FOUND'].includes(error.code)) throw error
          }
          // Classic Subsonic exposes untimed text. Never invent synchronization.
          try {
            let title = resource.data?.title,
              artist = resource.data?.artist
            if (!title) {
              const song = await request(account, 'getSong', { id: decoded.id }, operation)
              title = song.song?.title
              artist = song.song?.artist
            }
            if (title) {
              const response = await request(account, 'getLyrics', { artist, title }, operation)
              if (typeof response.lyrics?.value === 'string')
                document.plainText = response.lyrics.value
            }
          } catch (error) {
            if (!['UNSUPPORTED', 'NOT_FOUND'].includes(error.code)) throw error
          }
          return document
        },
      },
      playlists: {
        async categories() {
          return {
            items: categories.map(([id, title]) => ({
              ref: { pluginId: ctx.plugin.id, providerId, kind: 'playlist-category', id },
              title,
              capabilities: [],
              extensions: { group: 'Navidrome', hot: id === 'hot' },
            })),
          }
        },
        async list(resource, cursor, operation) {
          const account = current()
          const page = paging(cursor, resource.data?.limit)
          const category = str(resource.id, 'hot')
          if (category === 'hot')
            return pageOf(
              (await playlists(account, operation)).map((item) => playlist(account, item)),
              page,
            )
          if (category === 'starred') {
            const response = await request(account, 'getStarred2', {}, operation, true)
            const starred = response.starred2 || {}
            return pageOf(
              [
                playlist(
                  account,
                  { id: 'songs', name: '我收藏的歌曲', songCount: array(starred.song).length },
                  'starred',
                ),
                ...array(starred.album).map((item) => playlist(account, item, 'album')),
              ],
              page,
            )
          }
          if (!categories.some(([id]) => id === category))
            throw fault('NOT_FOUND', '未知音乐库分类')
          const response = await request(
            account,
            'getAlbumList2',
            { type: category, size: page.size + 1, offset: page.offset },
            operation,
          )
          const albums = array(response.albumList2?.album)
          return {
            items: albums.slice(0, page.size).map((item) => playlist(account, item, 'album')),
            totalEstimate: page.offset + albums.length,
            ...(albums.length > page.size ? { nextCursor: String(page.page + 1) } : {}),
          }
        },
        async search(input, operation) {
          const account = current()
          const query = str(input.query).trim().toLocaleLowerCase()
          const items = (await playlists(account, operation))
            .filter((item) =>
              (str(item.name) + ' ' + str(item.comment)).toLocaleLowerCase().includes(query),
            )
            .map((item) => playlist(account, item))
          return pageOf(items, paging(input.cursor, input.limit))
        },
        get: getPlaylist,
      },
    }),
  )
  ctx.effects.add(
    ctx.playlistImporters.register('navidrome-playlist', {
      async getTracks(input, operation) {
        const account = current()
        let id = str(input.value).trim()
        if (!id || id.length > 2048) throw fault('INVALID_INPUT', '请输入有效的歌单 ID 或页面地址')
        if (/^https?:\/\//i.test(id)) {
          const url = new URL(id)
          const base = new URL(account.serverUrl)
          if (
            url.origin !== base.origin ||
            url.username ||
            url.password ||
            !(
              url.pathname === base.pathname ||
              url.pathname.startsWith(base.pathname.replace(/\/$/, '') + '/')
            )
          ) {
            throw fault('INVALID_INPUT', '请使用当前已连接服务器的歌单地址')
          }
          const path = url.hash
            ? url.hash.slice(1)
            : url.pathname.slice(base.pathname.replace(/\/$/, '').length)
          const match = /^\/?playlist\/([^/?#]+)(?:\/show)?\/?$/.exec(path.split('?')[0])
          if (!match)
            throw fault('INVALID_INPUT', '地址中没有歌单 ID，请粘贴歌单页面地址或直接输入 ID')
          try {
            id = decodeURIComponent(match[1])
          } catch {
            throw fault('INVALID_INPUT', '歌单地址编码无效')
          }
        } else if (/^[a-z][a-z\d+.-]*:\/\//i.test(id))
          throw fault('INVALID_INPUT', '不支持此地址格式')
        return getPlaylist(
          ref(account, 'playlist', 'playlist', id),
          input.cursor,
          operation,
          input.limit,
        )
      },
    }),
  )
  ctx.effects.add(
    ctx.lyricConverters.register('navidrome-lyrics', {
      async parse(input) {
        if (input.format !== 'plain') throw fault('UNSUPPORTED', '此转换器仅接收纯文本歌词')
        return {
          format: 'crlyric',
          version: 1,
          track: input.track,
          offsetMs: 0,
          lines: [],
          plainText: input.text,
        }
      },
      async export(input) {
        if (!['lrc', 'enhanced-lrc'].includes(input.format))
          throw fault('UNSUPPORTED', 'Navidrome 歌词可导出为 LRC')
        const document = input.document
        const tag = (ms) => {
          const time = Math.max(0, Math.round(ms))
          return (
            '[' +
            String(Math.floor(time / 60000)).padStart(2, '0') +
            ':' +
            String(Math.floor(time / 1000) % 60).padStart(2, '0') +
            '.' +
            String(time % 1000).padStart(3, '0') +
            ']'
          )
        }
        const text = document.lines.length
          ? document.lines
              .map(
                (line) =>
                  tag(line.startTimeMs + document.offsetMs) + line.text.replace(/[\r\n]+/g, ' '),
              )
              .join('\n')
          : document.plainText || ''
        return { format: input.format, text, mime: 'text/plain', extension: 'lrc' }
      },
    }),
  )
  ctx.effects.add(() => {
    connection = null
    cache.clear()
  })
  await updateState()
}

exports.resources = {
  'schema.connection': {
    type: 'json',
    value: {
      schemaVersion: '1.0',
      presentation: {
        kind: 'drawer',
        placement: 'right',
        size: 480,
        openOnFirstUse: true,
      },
      root: {
        type: 'form',
        title: 'Navidrome 连接',
        submitAction: 'connection.open',
        submitInput: { mode: 'save' },
        submitLabel: '验证并保存',
        children: [
          { type: 'text', bind: 'status' },
          {
            type: 'text-input',
            bind: 'serverUrl',
            label: '服务器地址',
            placeholder: 'https://music.example.com',
            required: true,
          },
          { type: 'text-input', bind: 'username', label: '用户名', required: true },
          {
            type: 'password',
            bind: 'password',
            label: '密码',
            placeholder: '已连接时留空保留当前登录',
          },
          {
            type: 'select',
            bind: 'quality',
            label: '默认音质',
            options: [
              { label: '原始音质', value: 'original' },
              { label: 'MP3 · 320 kbps', value: '320k' },
              { label: 'MP3 · 192 kbps', value: '192k' },
              { label: 'MP3 · 128 kbps', value: '128k' },
            ],
          },
          { type: 'toggle', bind: 'allowLocal', label: '连接局域网或本机服务器' },
          {
            type: 'toggle',
            bind: 'remember',
            label: '在本机记住登录',
            description: '保存可用于登录的令牌；关闭时仅本次运行有效。',
          },
          {
            type: 'toggle',
            bind: 'showCovers',
            label: '显示服务器封面',
            description: '封面地址含访问令牌，导出或同步歌单时也可能携带。',
          },
          { type: 'button', label: '测试连接', action: 'source.status', requires: 'connected' },
          {
            type: 'button',
            label: '断开连接',
            action: 'connection.open',
            input: { mode: 'disconnect' },
            requires: 'connected',
          },
        ],
      },
    },
  },
}
