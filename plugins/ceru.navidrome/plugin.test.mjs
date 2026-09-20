import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import * as crypto from 'node:crypto'
import { readArtifact } from '@shiqianjiang/ceru-plugin-issuer'
import {
  assertContentPage,
  assertLyricsDocument,
  assertResolveResult,
} from '@shiqianjiang/ceru-plugin-sdk'

const code = await readFile(new URL('./plugin.js', import.meta.url), 'utf8')
const artifact = readArtifact(code)
const plain = (value) => JSON.parse(JSON.stringify(value))
const operation = () => ({
  id: crypto.randomUUID(),
  deadlineAt: Date.now() + 30000,
  signal: new AbortController().signal,
})
const login = {
  serverUrl: 'https://music.example.test/music/',
  username: 'demo & user',
  password: 'secret & 密码',
  quality: 'original',
  remember: false,
  allowLocal: false,
  showCovers: false,
}
const song = (id) => ({
  id: String(id),
  title: 'Track ' + id,
  artist: 'Artist',
  album: 'Album',
  albumId: 'a1',
  duration: 123.456,
  coverArt: 'art & 1',
})
const ok = (data = {}) => ({
  status: 200,
  headers: {},
  body: { 'subsonic-response': { status: 'ok', ...data } },
})
const fail = (code) =>
  ok({ status: 'failed', error: { code, message: 'Untrusted server error: secret & 密码' } })

async function harness(options = {}) {
  const actions = new Map(),
    providers = new Map(),
    importers = new Map(),
    converters = new Map()
  const storage = options.storage || new Map()
  const requests = [],
    states = [],
    permissions = new Map(),
    effects = [],
    uiCalls = []
  let respond = options.respond || (() => ok())
  const register = (map) => (id, handler) => {
    map.set(id, handler)
    return () => map.delete(id)
  }
  const ctx = {
    plugin: { id: artifact.header.manifest.id },
    actions: { register: register(actions) },
    providers: { register: register(providers) },
    playlistImporters: { register: register(importers) },
    lyricConverters: { register: register(converters) },
    effects: { add: (effect) => effects.push(effect) },
    playback: { failure: (error) => ({ ok: false, error }) },
    storage: {
      get: async (key) => storage.get(key),
      set: async (key, value) => storage.set(key, plain(value)),
      delete: async (key) => storage.delete(key),
    },
    permissions: {
      query: async ({ key }) => ({ status: permissions.get(key) || 'granted' }),
      request: async ({ key }) => {
        permissions.set(key, 'granted')
        return { status: 'granted' }
      },
    },
    http: {
      request: async (request) => {
        requests.push(request)
        const url = new URL(request.url)
        return respond(
          url.pathname.split('/').at(-1).replace('.view', ''),
          url.searchParams,
          request,
        )
      },
    },
    ui: {
      setState: async (_id, state) => states.push(plain(state)),
      toast: async (input) => uiCalls.push(input),
      openView: async (id) => uiCalls.push(id),
      playlistImport: { open: async (input) => uiCalls.push(input) },
    },
  }
  const activate = vm.runInNewContext('(' + artifact.modules['logic.main'] + ')', {
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    AbortController,
    require(name) {
      assert.equal(name, '@ceru/crypto')
      return crypto
    },
  })
  await activate(ctx)
  return {
    actions,
    provider: providers.get('navidrome'),
    importer: importers.get('navidrome-playlist'),
    converter: converters.get('navidrome-lyrics'),
    storage,
    requests,
    states,
    permissions,
    uiCalls,
    respond(fn) {
      respond = fn
    },
    act: (name, input = {}, op = operation()) =>
      name.startsWith('connection.')
        ? actions.get('connection.open')({ ...input, mode: name.split('.')[1] }, op)
        : actions.get(name)(input, op),
    connect: (input = {}) =>
      actions.get('connection.open')({ ...login, ...input, mode: 'save' }, operation()),
  }
}

test('public artifact is v2, activates offline, and exposes native contributions', async () => {
  assert.equal(artifact.header.manifest.manifestVersion, 2)
  assert.equal(artifact.header.manifest.modules.share, undefined)
  assert.equal(artifact.header.manifest.contributes.homeSections[0].kind, 'playlists')
  assert.equal(artifact.header.manifest.modules.surfaces[0].kind, 'schema')
  assert.equal(artifact.header.manifest.contributes.settingsPages, undefined)
  assert.equal(artifact.resources['schema.connection'].value.presentation.placement, 'right')
  assert.equal(artifact.resources['schema.connection'].value.presentation.openOnFirstUse, true)
  const h = await harness()
  assert.equal(h.requests.length, 0)
  assert.equal((await h.act('connection.state')).connected, false)
  const result = await h.provider.tracks.resolve({ id: '1' }, undefined, operation())
  assert.equal(result.error.code, 'AUTH_REQUIRED')
  await h.act('playlist.import')
  assert.equal(h.uiCalls[0].importerId, 'navidrome-playlist')
})

test('login normalizes subpaths, signs Unicode credentials, and keeps passwords out of state/storage', async () => {
  const h = await harness()
  await h.connect({ serverUrl: login.serverUrl + 'rest/ping.view#ignored', remember: true })
  const url = new URL(h.requests[0].url)
  assert.equal(url.pathname, '/music/rest/ping.view')
  assert.equal(url.searchParams.get('u'), login.username)
  assert.equal(
    url.searchParams.get('t'),
    crypto
      .createHash('md5')
      .update(login.password + url.searchParams.get('s'))
      .digest('hex'),
  )
  assert.equal(url.searchParams.has('p'), false)
  assert.equal(JSON.stringify([...h.storage]).includes(login.password), false)
  assert.equal(JSON.stringify(h.states).includes(url.searchParams.get('t')), false)
  const restored = await harness({ storage: h.storage })
  assert.equal((await restored.act('connection.state')).connected, true)
  assert.equal(restored.requests.length, 0)
  await restored.act('connection.disconnect')
  assert.equal(h.storage.size, 0)
})

test('bad config and failed authentication cannot replace the active account', async () => {
  const h = await harness()
  for (const serverUrl of [
    'file:///music',
    'https://user:pass@example.test',
    'https://example.test?token=a',
    'not a url',
  ]) {
    await assert.rejects(h.connect({ serverUrl }), /地址/)
  }
  assert.equal(h.requests.length, 0)
  await h.connect()
  h.respond(() => fail(40))
  await assert.rejects(h.connect({ username: 'another' }), /登录/)
  assert.equal((await h.act('connection.state')).username, login.username)
  assert.equal(h.storage.size, 0)
})

test('search uses host page numbers and one-item lookahead without overlapping results', async () => {
  const h = await harness()
  await h.connect()
  h.respond((endpoint, params) => {
    assert.equal(endpoint, 'search3')
    assert.equal(params.get('query'), 'A & B')
    const offset = Number(params.get('songOffset')),
      count = Number(params.get('songCount'))
    return ok({
      searchResult3: {
        song: Array.from({ length: 5 }, (_, i) => song(i)).slice(offset, offset + count),
      },
    })
  })
  const pages = []
  for (const cursor of [undefined, '2', '3']) {
    const page = await h.provider.tracks.search({ query: 'A & B', limit: 2, cursor }, operation())
    assertContentPage(page)
    pages.push(page)
  }
  assert.deepEqual(
    pages.map((p) => p.items.length),
    [2, 2, 1],
  )
  assert.equal(pages[2].nextCursor, undefined)
  assert.equal(new Set(pages.flatMap((p) => p.items.map((item) => item.ref.id))).size, 5)
  assert.equal(pages[0].items[0].metadata.durationMs, 123456)
  assert.equal(pages[0].items[0].metadata.artworkUrl, '')
  assert.equal(pages[0].items[0].ref.data.url, undefined)
  await assert.rejects(
    h.provider.tracks.search({ query: 'a', limit: 2, cursor: '-1' }, operation()),
    /分页/,
  )
})

test('playlist and album identities survive the desktop bridge dropping private reference fields', async () => {
  const h = await harness()
  await h.connect()
  h.respond((endpoint) => {
    if (endpoint === 'getPlaylists')
      return ok({ playlists: { playlist: { id: 'p&1', name: 'My list', songCount: 205 } } })
    if (endpoint === 'getPlaylist')
      return ok({
        playlist: {
          id: 'p&1',
          name: 'My list',
          entry: Array.from({ length: 205 }, (_, i) => song(i)),
        },
      })
    if (endpoint === 'getAlbumList2')
      return ok({ albumList2: { album: { id: 'a1', name: 'Album', songCount: 1 } } })
    if (endpoint === 'getAlbum') return ok({ album: { id: 'a1', name: 'Album', song: song(99) } })
    throw new Error(endpoint)
  })
  const lists = await h.provider.playlists.list({ id: 'hot' }, '1', operation())
  assertContentPage(lists)
  const ref = { ...lists.items[0].ref }
  delete ref.connectionId
  const page1 = await h.provider.playlists.get(ref, '1', operation())
  const page2 = await h.provider.playlists.get(ref, '2', operation())
  assert.equal(page1.items.length, 200)
  assert.equal(page2.items.length, 5)
  assert.equal(page1.nextCursor, '2')
  assert.equal(h.requests.filter((r) => r.url.includes('getPlaylist.view')).length, 1)
  assertContentPage(page2)
  const albums = await h.provider.playlists.list({ id: 'newest' }, undefined, operation())
  assertContentPage(albums)
  const album = await h.provider.playlists.get(albums.items[0].ref, '1', operation())
  assert.equal(album.name, 'Album')
  assert.equal(album.items.length, 1)
})

test('native importer pages only the configured server and preserves encoded playlist IDs', async () => {
  const h = await harness()
  await h.connect()
  h.respond((endpoint, params) => {
    assert.equal(endpoint, 'getPlaylist')
    assert.equal(params.get('id'), 'p&1')
    return ok({ playlist: { name: 'Import', entry: [song(1), song(2), song(3)] } })
  })
  const value = 'https://music.example.test/music/app/#/playlist/p%261/show'
  const page1 = await h.importer.getTracks({ value, limit: 2 }, operation())
  const page2 = await h.importer.getTracks(
    { value, limit: 2, cursor: page1.nextCursor },
    operation(),
  )
  assert.equal(page2.items.length, 1)
  assert.equal(page2.nextCursor, undefined)
  assertContentPage(page1)
  await assert.rejects(
    h.importer.getTracks({ value: 'https://evil.test/#/playlist/p1', limit: 2 }, operation()),
    /已连接/,
  )
  await assert.rejects(
    h.importer.getTracks(
      { value: 'https://music.example.test/music2/#/playlist/p1', limit: 2 },
      operation(),
    ),
    /已连接/,
  )
})

test('playback honors quality, preserves IDs, and rejects another account with the same song ID', async () => {
  const h = await harness()
  await h.connect()
  h.respond(() => ok({ searchResult3: { song: song('a&b/#汉字') } }))
  const { items } = await h.provider.tracks.search({ query: 'a', limit: 2 }, operation())
  for (const quality of ['original', '192k']) {
    const result = await h.provider.tracks.resolve(items[0].ref, quality, operation())
    assertResolveResult(result)
    const url = new URL(result.url)
    assert.equal(url.searchParams.get('id'), 'a&b/#汉字')
    assert.equal(url.searchParams.get('format'), quality === 'original' ? 'raw' : 'mp3')
    assert.equal(url.searchParams.get('maxBitRate'), quality === 'original' ? null : '192')
  }
  h.respond(() => ok())
  await h.connect({ username: 'another account' })
  assert.equal(
    (await h.provider.tracks.resolve(items[0].ref, 'original', operation())).error.code,
    'AUTH_REQUIRED',
  )
  const copied = { ...items[0].ref, providerId: 'somewhere-else' }
  assert.equal(
    (await h.provider.tracks.resolve(copied, 'original', operation())).error.code,
    'NOT_FOUND',
  )
})

test('revocation and cancellation are honored even with cached playlists or a locally resolved stream', async () => {
  const h = await harness()
  await h.connect()
  h.respond(() => ok({ playlists: { playlist: [] } }))
  await h.provider.playlists.list({ id: 'hot' }, '1', operation())
  h.permissions.set('navidrome.http', 'denied')
  await assert.rejects(h.provider.playlists.list({ id: 'hot' }, '1', operation()), /权限/)
  h.permissions.set('navidrome.http', 'granted')
  const abort = new AbortController()
  abort.abort()
  await assert.rejects(
    h.provider.tracks.search({ query: 'a', limit: 20 }, { ...operation(), signal: abort.signal }),
    /取消/,
  )
})

test('standard lyrics preserve milliseconds and offset; plain lyrics are never given invented timestamps', async () => {
  const h = await harness()
  await h.connect()
  h.respond(() => ok({ searchResult3: { song: song(1) } }))
  const resource = (await h.provider.tracks.search({ query: 'a', limit: 2 }, operation())).items[0]
    .ref
  h.respond(() =>
    ok({
      lyricsList: {
        structuredLyrics: [
          { synced: false, line: { value: 'plain' } },
          {
            synced: true,
            offset: -120,
            line: [
              { start: 3001, value: 'later' },
              { start: 0, value: 'first' },
            ],
          },
        ],
      },
    }),
  )
  const synced = await h.provider.tracks.lyrics(resource, operation())
  assertLyricsDocument(synced)
  assert.equal(synced.offsetMs, -120)
  assert.deepEqual(plain(synced.lines.map((line) => line.startTimeMs)), [0, 3001])
  const exported = await h.converter.export({ document: synced, format: 'lrc' })
  assert.equal(exported.text, '[00:00.000]first\n[00:02.881]later')
  h.respond(() =>
    ok({
      lyricsList: {
        structuredLyrics: { synced: false, line: [{ value: 'one' }, { value: 'two' }] },
      },
    }),
  )
  const untimed = await h.provider.tracks.lyrics(resource, operation())
  assertLyricsDocument(untimed)
  assert.equal(untimed.lines.length, 0)
  assert.equal(untimed.plainText, 'one\ntwo')
  h.respond((endpoint) =>
    endpoint === 'getLyricsBySongId' ? fail(70) : ok({ lyrics: { value: 'legacy plain' } }),
  )
  assert.equal((await h.provider.tracks.lyrics(resource, operation())).plainText, 'legacy plain')
  h.respond(() => fail(40))
  await assert.rejects(h.provider.tracks.lyrics(resource, operation()), /登录/)
})

test('favorites and playlist filtering are exposed through native playlist methods', async () => {
  const h = await harness()
  await h.connect()
  h.respond((endpoint) =>
    endpoint === 'getPlaylists'
      ? ok({
          playlists: {
            playlist: [
              { id: '1', name: 'Morning' },
              { id: '2', name: 'Night' },
            ],
          },
        })
      : ok({ starred2: { song: [song(1)], album: { id: 'a1', name: 'Favorite album' } } }),
  )
  assertContentPage(await h.provider.playlists.categories(operation()))
  const matches = await h.provider.playlists.search({ query: 'night', limit: 30 }, operation())
  assert.equal(matches.items.length, 1)
  const favorites = await h.provider.playlists.list({ id: 'starred' }, '1', operation())
  assert.equal(favorites.items.length, 2)
  const songs = await h.provider.playlists.get(favorites.items[0].ref, '1', operation())
  assert.equal(songs.items.length, 1)
})

test('HTTP and malformed response errors are actionable and do not echo secrets', async () => {
  const h = await harness()
  for (const response of [
    { status: 502 },
    { status: 200, body: '<html>proxy</html>' },
    ok({ status: 'invalid' }),
    fail(0),
  ]) {
    h.respond(() => response)
    await assert.rejects(
      h.connect(),
      (error) =>
        !error.message.includes(login.password) && /服务器|Subsonic|JSON/.test(error.message),
    )
  }
})

test(
  'real Ceru Node sandbox loads and runs the installed artifact',
  { skip: !process.env.CERU_NODE_SANDBOX_MODULE },
  async () => {
    const { NodePluginSandbox } = await import(process.env.CERU_NODE_SANDBOX_MODULE)
    const registrations = [],
      calls = []
    const sandbox = new NodePluginSandbox(
      async (method, data) => {
        calls.push(method)
        if (method === 'storage.get') return null
        if (method === 'storage.delete') return null
        if (method === 'permissions.query') return { status: 'granted' }
        if (method === 'http.request') {
          const url = new URL(data.url)
          assert.equal(url.pathname.startsWith('/music/rest/'), true)
          if (url.pathname.endsWith('search3.view'))
            return ok({ searchResult3: { song: [song(1)] } })
          return ok({ serverVersion: 'test' })
        }
        throw new Error('Unexpected Host call ' + method)
      },
      (type, data) => {
        if (type === 'register') registrations.push(data)
      },
    )
    try {
      await sandbox.start(artifact)
      assert.equal(calls.includes('http.request'), false)
      assert.equal(
        registrations.some((entry) => entry.kind === 'provider'),
        true,
      )
      const state = await sandbox.invoke('action', 'connection.open', '', [
        { ...login, mode: 'save' },
      ])
      assert.equal(state.connected, true)
      const result = await sandbox.invoke('provider', 'navidrome', 'tracks.search', [
        { query: 'a', limit: 20 },
      ])
      assertContentPage(result)
      const resolved = await sandbox.invoke('provider', 'navidrome', 'tracks.resolve', [
        result.items[0].ref,
        'original',
      ])
      assertResolveResult(resolved)
      assert.equal(resolved.ok, true)
    } finally {
      sandbox.dispose()
    }
  },
)
