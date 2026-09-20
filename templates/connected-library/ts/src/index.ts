import { assertResourceRef, defineNativeView, definePlugin } from '@shiqianjiang/ceru-plugin-sdk'

export default definePlugin(async (ctx) => {
  let connected = false
  const playlist = {
    ref: { pluginId: ctx.plugin.id, providerId: 'catalog', connectionId: 'demo', kind: 'playlist', id: 'demo' },
    title: '演示歌单',
    playlist: { description: '由插件提供数据，由 Host 渲染原生歌单卡片', trackCount: 1 },
    capabilities: ['open'],
  }
  const tracks = [{
    ref: { pluginId: ctx.plugin.id, providerId: 'catalog', connectionId: 'demo', kind: 'track', id: 'demo-track' },
    title: '接入你的音乐库后即可播放',
    metadata: { artists: ['演示歌手'] },
    capabilities: ['play'],
  }]
  await ctx.ui.setState('settings', {
    serverUrl: 'https://music.example.com',
    status: '等待演示连接',
  })
  ctx.actions.register('hello', () => ctx.ui.openView('settings'))
  ctx.actions.register('library.open', () => ctx.ui.navigation.open({ page: 'playlist', sectionId: 'library' }))
  ctx.actions.register('account.summary', () => ({
    signedIn: connected,
    displayName: connected ? '演示音乐库' : '连接你的音乐库',
  }))
  ctx.actions.register('render.library', defineNativeView(() => ({
    type: 'page',
    description: connected ? '演示连接已建立' : '可先浏览演示内容，再接入自己的音乐库 API。',
    actions: [{ label: '连接设置', action: 'hello' }],
    sections: [
      { id: 'playlists', title: '我的歌单', layout: 'grid', items: [playlist], onOpen: 'playlist.open',
        itemActions: [{ label: '导入歌单', action: 'playlist.import' }] },
      { id: 'tracks', title: '歌曲', layout: 'list', items: tracks, onPlay: 'track.play' },
    ],
  })))
  ctx.actions.register('playlist.open', async (input) => {
    const ref = input && typeof input === 'object' && !Array.isArray(input) ? input.ref : undefined
    assertResourceRef(ref)
    if (ref.pluginId !== ctx.plugin.id || ref.providerId !== 'catalog' || ref.id !== playlist.ref.id)
      throw new Error('Unknown playlist')
    await ctx.ui.navigation.open({ page: 'playlist', ref })
  })
  ctx.actions.register('playlist.import', () =>
    ctx.ui.playlistImport.open({ importerId: 'catalog', initialValue: playlist.ref.id }))
  ctx.actions.register('track.play', async (_input, operation) => {
    const grants = await ctx.permissions.requestGroup({ group: 'playbackControl' })
    if (grants.status !== 'granted') throw new Error('需要播放控制权限')
    const call = { permissionKey: 'playback', operation }
    await ctx.queue.replace(tracks, call)
    await ctx.player.play(tracks[0].ref, call)
  })
  ctx.playlistImporters.register('catalog', {
    async getTracks() { return { name: playlist.title, items: tracks } },
  })

  ctx.actions.register('connection.connect', async (input) => {
    if (
      !input ||
      typeof input !== 'object' ||
      Array.isArray(input) ||
      typeof input.serverUrl !== 'string'
    ) {
      throw new Error('请输入服务器地址')
    }
    const server = new URL(input.serverUrl)
    if (!['http:', 'https:'].includes(server.protocol)) throw new Error('只支持 HTTP(S) 地址')

    connected = true
    await ctx.ui.setState('library', { connected })
    // 本地 demo 不联网，也不收集密码。真实连接应使用 Host 的凭据与网络 API。
    await ctx.ui.setState('settings', {
      serverUrl: server.origin,
      status: '演示连接成功：' + server.origin + '（未发出网络请求）',
    })
    await ctx.ui.navigation.open({ page: 'playlist', sectionId: 'library' })
    return { status: 'demo-connected', origin: server.origin }
  })

  ctx.providers.register('catalog', {
    playlists: {
      async get() { return { name: playlist.title, playlist: playlist.playlist, items: tracks } },
    },
    tracks: {
      async search() {
        return { items: [] }
      },
      async resolve() {
        return ctx.playback.failure({ code: 'UNSUPPORTED', message: '请接入真实音乐库 API' })
      },
    },
  })
})
