import { definePlugin } from '@shiqianjiang/ceru-plugin-sdk'

export default definePlugin(async (ctx) => {
  ctx.hooks.on('player.resolve', async (op, next) => {
    const { ref } = op.input.track
    if (ref.providerId !== 'demo-primary' || ref.id !== 'morning') return
    const result = await next()
    if (result.ok) return result
    return next({
      ...op.input,
      track: { ...op.input.track, ref: { kind: 'track', providerId: 'demo-backup', id: 'morning-alt' } },
    })
  })
  ctx.hooks.on('player.play', (op) => {
    if (op.input.track.title.startsWith('[拦截示例]')) op.preventDefault()
  })
  ctx.hooks.on('queue.remove', op => {
    if (op.input.tracks.some(track => track.title.startsWith('[保护示例]'))) op.preventDefault()
  })
  ctx.hooks.on('queue.add', async (op, next) => {
    if (op.input.tracks.some((track) => track.title.startsWith('[优先示例]'))) {
      await next({ ...op.input, position: 'next' })
    }
  })
})
