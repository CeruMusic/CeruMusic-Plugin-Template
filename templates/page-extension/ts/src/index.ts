import { definePlugin, type ResourceRef } from '@shiqianjiang/ceru-plugin-sdk'
export default definePlugin((ctx) => {
  const refs = new Map<string, ResourceRef>()
  let generation = 0
  ctx.actions.register('search', async (input, operation) => {
    const request = ++generation
    const sources = await ctx.music.sources()
    const source = sources.find((item) => item.available)
    const result = source
      ? await ctx.music.search(
          source.id,
          {
            query: typeof input === 'string' ? input : '',
            kinds: ['track'],
            limit: 30,
            filters: {},
          },
          { permissionKey: 'catalog', operation },
        )
      : { items: [] }
    if (request !== generation) return { count: 0 }
    refs.clear()
    const items = result.items.map((item, index) => {
      const key = request + ':' + index
      const durationMs = item.durationMs ?? item.metadata?.durationMs
      refs.set(key, item.ref)
      return {
        key,
        title: item.title,
        source: item.ref.providerId,
        playable: item.playable !== false,
        metadata: {
          artists: item.metadata?.artists ?? [],
          qualities: item.metadata?.qualities ?? [],
        },
        ...(durationMs !== undefined ? { durationMs } : {}),
      }
    })
    await ctx.ui.views.setState('search', { items, searched: true })
    return { count: items.length }
  })
  function resolveKey(key: unknown) {
    const ref = typeof key === 'string' && refs.get(key)
    if (!ref) throw Error('搜索结果已更新，请重新选择歌曲')
    return ref
  }
  ctx.actions.register('play', async (key, operation) => {
    await ctx.music.play(resolveKey(key), { permissionKey: 'listen', operation })
  })
  ctx.actions.register('enqueue', async (key, operation) => {
    await ctx.music.enqueue([resolveKey(key)], 'end', { permissionKey: 'listen', operation })
  })
  ctx.actions.register('open', () => ctx.ui.pages.open('search'))
})
