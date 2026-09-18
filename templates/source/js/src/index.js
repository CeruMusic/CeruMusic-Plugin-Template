import { definePlugin } from '@shiqianjiang/ceru-plugin-sdk'

/** @typedef {typeof import('./plugin.config.js').default} PluginConfig */

// 本地演示数据。请在接入真实音源时声明所需的网络权限。
const tracks = [
  { id: 'morning', title: 'Morning Light', artist: 'Ceru Demo' },
  { id: 'rain', title: 'Rainy Afternoon', artist: 'Ceru Demo' },
  { id: 'night', title: 'Night Walk', artist: 'Ceru Demo' },
]

export default definePlugin(async (ctx) => {
  /** @type {Readonly<PluginConfig>} */
  const config = await ctx.config.get()
  ctx.actions.register('hello', async () => {
    await ctx.ui.notify({
      key: 'welcome',
      level: 'info',
      message: `${config.displayName} 已就绪。试试搜索 Morning、Rain 或 Night。`,
    })
  })

  ctx.providers.register('catalog', {
    tracks: {
      async search(request) {
        const query = ctx.utils.lodash.trim(request.query).toLowerCase()
        const matches = tracks.filter((track) =>
          (track.title + ' ' + track.artist).toLowerCase().includes(query),
        )

        return {
          items: matches.slice(0, Math.max(1, Math.min(request.limit, 100))).map((track) => ({
            ref: {
              pluginId: ctx.plugin.id,
              providerId: 'catalog',
              kind: 'track',
              id: track.id,
            },
            title: track.title,
            subtitle: track.artist,
            playable: false,
            metadata: { artists: [track.artist] },
            capabilities: [],
          })),
        }
      },

      async resolve() {
        // 演示不会伪造播放地址。真实解析器返回 { ok: true, url, expiresAt? }。
        return ctx.playback.failure({
          code: 'UNSUPPORTED',
          message: '这是本地搜索 demo，尚未连接真实的音源服务。',
        })
      },
    },
  })
})
