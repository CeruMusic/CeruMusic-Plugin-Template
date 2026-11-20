import { definePlugin } from '@shiqianjiang/ceru-plugin-sdk'

// undefined: 软件默认模板；'login': 宿主 Vue/TDesign；'login-html': 纯 HTML/CSS。
const loginView = 'login'
const demoImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATiSURBVO3BQY4cSRIEQdNA/f/Lujz6KYBEenWTsyaCf6RqyUnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhadVC06qVp0UrXok5eA/CQ1E5AbNROQSc0E5Ak1E5A31ExAfpKaN06qFp1ULTqpWvTJMjWbgGxS84SaGyA3am6APKFmE5BNJ1WLTqoWnVQt+uTLgDyh5gk1E5AbIDdq3lAzAZnUbALyhJpvOqladFK16KRq0Sf/OCDfBORGzQRkUjMBmdT8l5xULTqpWnRSteiTf5yaCcgTap5QMwGZ1DwBZFLzLzupWnRSteikatEnX6bmNwF5AsikZgJyA+QnqfmbnFQtOqladFK16JNlQH4SkEnNBGRSMwGZ1ExAJjUTkEnNBGRSMwF5Asjf7KRq0UnVopOqRfhH/mFANqm5AfKEmv8nJ1WLTqoWnVQt+uQlIJOaCciNmgnIE2pugExqboBMat4AcqPmBsik5gbIpGYCcqPmjZOqRSdVi06qFuEf+YcA+ZuoeQLIN6l5Asik5o2TqkUnVYtOqhZ98mVAnlAzAZnU3ACZ1ExAnlBzA2RSMwGZ1ExAnlDzBJAbNZtOqhadVC06qVr0yUtAJjU3aiYgN2omIDdqJiCTmjeATGpu1ExAbtQ8AWRSM6m5ATKpeeOkatFJ1aKTqkWffJmaCcikZgKySc0NkEnNBGRScwNkUnOjZgIyqblRMwG5UTOp2XRSteikatFJ1SL8I4uA3Kh5A8gTat4A8oaaCcik5gbIpOYJIE+oeeOkatFJ1aKTqkWffJmaGyCTmgnIjZoJyA2QSc0EZFLzk4BMaiYgN2p+00nVopOqRSdViz75ZWpu1ExAbtRMQJ5QMwF5Qs2NmieAvKFmAjKp2XRSteikatFJ1aJPXgJyA+QJNROQbwIyqXlCzQ2QSc0TaiYgN0AmNT/ppGrRSdWik6pFn7yk5g0gE5BJzQTkCTUTkG8CMqm5ATKpeULNBGQC8pNOqhadVC06qVr0yUtAJjU3QCY1E5AJyA2QSc0bQJ4AMqn5TWomIJOabzqpWnRSteikahH+kV8E5EbNE0AmNU8AuVEzAblR8wSQSc0NkEnNBGRS800nVYtOqhadVC36ZBmQGzU3aiYgN2omNTdAJjXfBGRSMwG5AfIEkN90UrXopGrRSdWiT5apeULNjZobIJOaCcikZgIyqflNap4A8gSQGzVvnFQtOqladFK16JOXgPwkNW8AmdTcAJnUTGomIJOaCcgTQCY1T6iZgExqNp1ULTqpWnRSteiTZWo2AXlDzRNA3lAzAZnUTEBu1GxS800nVYtOqhadVC365MuAPKHmCTUTkBs1N2pugExqJiCTmieAvKFmAnKjZtNJ1aKTqkUnVYs++ccBmdRMQCYgk5oJyKTmBsgTQJ5QMwG5ATKpuQEyqXnjpGrRSdWik6pFn/zHqXlCzY2aJ4DcqJmAPKHmBsik5ptOqhadVC06qVr0yZep+SY1E5An1LwBZFJzo2YCcgNkUjMBuVEzAZnUbDqpWnRSteikatEny4D8JCCTmhsgE5BJzQTkRs2NmgnIjZo31Pymk6pFJ1WLTqoW4R+pWnJSteikatFJ1aKTqkUnVYtOqhadVC06qVp0UrXopGrRSdWik6pFJ1WLTqoWnVQt+h8AsUc0QEvSvQAAAABJRU5ErkJggg=="
export default definePlugin((ctx) => {
  ctx.accounts.register('demo', {
    async login({ auth }) {
      let polls = 0
      return auth.qrcode({
        image: demoImage,
        view: loginView,
        expiresInMs: 120000,
        async poll(operation) {
          operation.signal.throwIfAborted()
          // 本地演示：约 5 秒后“已扫码”，约 10 秒后完成。请替换成平台 API。
          polls++
          if (polls >= 11) return { status: 'done', credential: 'synthetic-demo-only' }
          return { status: polls >= 6 ? 'scanned' : 'waiting' }
        },
      })
    },
    profile: () => ({ id: 'demo', displayName: '扫码演示用户' }),
  })
})
