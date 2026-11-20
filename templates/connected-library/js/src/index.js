import { assertResourceRef, defineNativeView, definePlugin } from '@shiqianjiang/ceru-plugin-sdk'

export default definePlugin(async (ctx) => {
  let connected = false
  ctx.actions.register('catalog.enter', async () => {
    const current = await ctx.accounts.current('catalog')
    if (current && !current.expired) return true
    const login = { accountId: 'catalog' }
    if (current?.expired) Object.assign(login, { connectionId: current.connectionId })
    return { login }
  })
  const accountVisible = async () => {
    const current = await ctx.accounts.current('catalog')
    return current !== null && !current.expired
  }
  ctx.actions.register('connection.visible', accountVisible)
  let pendingName = ''
  const accountTrack=async (connection,label)=>({
    ref:{pluginId:ctx.plugin.id,providerId:'catalog',kind:'track',id:'demo-track',connectionId:connection},
    title:String(await ctx.storage.get('demo.account.'+connection))+' · '+label,
    metadata:{artists:['演示歌手']},capabilities:['play'],
  })
  ctx.accounts.register('catalog', {
    likes:{
      async list(account){const hidden=await ctx.storage.get('demo.unliked.'+account.id);return {items:hidden?[]:[await accountTrack(account.id,'喜欢的歌曲')]}},
      async set(account,{ref,liked}){if(ref.id!=='demo-track')throw Error('未知演示歌曲');await ctx.storage.set('demo.unliked.'+account.id,!liked)},
    },
    history:{async list(account){return {items:[await accountTrack(account.id,'最近播放')]}}},
    recommend:{async list(account){return {items:[await accountTrack(account.id,'今日推荐')]}}},
    playlists:{async list(account){return {items:[{ref:{pluginId:ctx.plugin.id,providerId:'catalog',connectionId:account.id,kind:'playlist',id:'demo'},title:String(await ctx.storage.get('demo.account.'+account.id))+' · 我的歌单',playlist:{trackCount:1},capabilities:['open']}]}}},
    async login({ auth }) {
      const values = await auth.form({ fields: [{ key: 'name', label: '演示昵称', type: 'text' }] })
      pendingName = values?.name.trim().slice(0, 80) || ''
      if (!pendingName) return null
      return { credential: 'local-demo:' + pendingName }
    },
    async profile(account) {
      const key = 'demo.account.' + account.id
      if (pendingName) { await ctx.storage.set(key, pendingName); pendingName = '' }
      const name = String(await ctx.storage.get(key) || '演示用户')
      return { id: name, displayName: name }
    },
    async logout(account) { await ctx.storage.delete('demo.account.' + account.id);await ctx.storage.delete('demo.unliked.'+account.id) }
  })
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
  ctx.actions.register('account.summary', async () => {
    const signedIn = await accountVisible()
    return { signedIn, displayName: signedIn ? '演示音乐库' : '连接你的音乐库' }
  })
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
    await ctx.entries.invalidate()
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
      async get(_resource,_cursor,operation) { return { name: playlist.title, playlist: playlist.playlist, items: operation.connectionId ? [await accountTrack(operation.connectionId,'歌单歌曲')] : tracks } },
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
