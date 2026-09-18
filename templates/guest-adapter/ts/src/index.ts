import { definePlugin } from '@shiqianjiang/ceru-plugin-sdk'

export default definePlugin(async (ctx) => {
  ctx.actions.register('hello', async () => {
    await ctx.ui.notify({ key: 'hello', level: 'info', message: 'Hello Ceru v2!' })
  })
  await ctx.ui.setState('settings', { status: '需要配置' })
})
