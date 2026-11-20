import { defineSurface } from '@shiqianjiang/ceru-plugin-sdk'

export default defineSurface(ctx => {
  const message = document.createElement('p')
  message.textContent = '请在插件入口中实现你的服务逻辑。'
  ctx.root.replaceChildren(message)
  return () => ctx.root.replaceChildren()
})
