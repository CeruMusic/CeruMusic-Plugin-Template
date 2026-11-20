import { definePlugin } from '@shiqianjiang/ceru-plugin-sdk'

/** @typedef {import('@ceru/plugin-config').PluginConfig} PluginConfig */

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
    const appCapability = await ctx.capabilities.get('app')
    const appInfo =
      appCapability.available && appCapability.methods?.includes('getInfo')
        ? await ctx.app.getInfo()
        : null
    await ctx.ui.notify({
      key: 'welcome',
      level: 'info',
      message: `${config.displayName} 已就绪${appInfo ? `，宿主版本 ${appInfo.version}` : ''}。试试搜索 Morning、Rain 或 Night。`,
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
            playable: !!config.previewUrl,
            metadata: { artists: [track.artist] },
            capabilities: config.previewUrl ? ['play'] : [],
          })),
        }
      },

      async resolve(ref) {
        if (config.previewUrl && tracks.some(track => track.id === ref.id))
          return { ok: true, url: config.previewUrl }
        return ctx.playback.failure({code:'UNSUPPORTED', message:'请在 previewUrl 配置自己的 HTTP(S) 试听文件。'})
      },
      async lyrics(ref) {
        const track = tracks.find(item => item.id === ref.id)
        return {format:'crlyric',version:1,track:ref,offsetMs:0,lines:track ? [{startTimeMs:0,text:track.title}] : []}
      },
    },
  })
})
