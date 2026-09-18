import { definePlugin } from '@shiqianjiang/ceru-plugin-sdk'

export default definePlugin(async (ctx) => {
  await ctx.ui.setState('settings', {
    serverUrl: 'https://music.example.com',
    status: '等待演示连接',
  })
  ctx.actions.register('hello', () => ctx.ui.openView('settings'))

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

    // 本地 demo 不联网，也不收集密码。真实连接应使用 Host 的凭据与网络 API。
    await ctx.ui.setState('settings', {
      serverUrl: server.origin,
      status: '演示连接成功：' + server.origin + '（未发出网络请求）',
    })
    return { status: 'demo-connected', origin: server.origin }
  })

  ctx.providers.register('catalog', {
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
