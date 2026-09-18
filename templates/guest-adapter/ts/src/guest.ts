import { defineGuestAdapter } from '@shiqianjiang/ceru-plugin-sdk'

export default defineGuestAdapter((ctx) => {
  // 在 Guest 身份下实现兼容 API；不能注入父插件凭据。
  ctx.expose('compatibilityVersion', 'basic@1')
})
