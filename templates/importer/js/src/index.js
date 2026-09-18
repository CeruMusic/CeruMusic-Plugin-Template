import { definePlugin } from '@shiqianjiang/ceru-plugin-sdk'

export default definePlugin((ctx) => {
  ctx.effects.add(
    ctx.playlistImporters.register('text-list', {
      async getTracks(request) {
        // Demo metadata only. A real importer resolves platform links and returns track IDs.
        const titles = ctx.utils.lodash.uniq(
          request.value
            .split(/[,，\n]+/)
            .map((title) => title.trim())
            .filter(Boolean),
        )
        return {
          name: '文本清单',
          items: titles.map((title) => ({
            ref: { pluginId: ctx.plugin.id, providerId: 'text-list', kind: 'track', id: title },
            title,
            playable: false,
            metadata: { artists: [] },
            capabilities: [],
          })),
          totalEstimate: titles.length,
        }
      },
    }),
  )
  ctx.effects.add(
    ctx.actions.register('hello', () => ctx.ui.playlistImport.open({ importerId: 'text-list' })),
  )
})
