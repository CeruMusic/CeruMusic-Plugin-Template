import { definePlugin } from '@shiqianjiang/ceru-plugin-sdk'

export default definePlugin(async (ctx) => {
  ctx.actions.register('page.open', async () => {
    await ctx.ui.setState('page', { status: '页面已打开，可在插件中自行实现交互' })
  })
  ctx.actions.register('page.close', async () => {
    // 在这里取消后台轮询或释放当前页面占用的资源。
    await ctx.ui.setState('page', { status: '页面已关闭' })
  })
  ctx.actions.register('hello', async () => {
    await ctx.ui.notify({ key: 'hello', level: 'info', message: 'Hello Ceru v2!' })
  })
})
