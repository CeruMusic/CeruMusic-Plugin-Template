import { defineSurface, type AccountQrViewState } from '@shiqianjiang/ceru-plugin-sdk'

// 没有 Vue 或 UI 组件依赖；只控制弹窗内部内容，外壳、标题与关闭按钮属于软件。
export default defineSurface((ctx) => {
  ctx.root.innerHTML = `<style>
    .custom-login { font: 14px/1.6 system-ui; color: var(--td-text-color-primary); padding: 8px; display: grid; gap: 16px; justify-items: center; }
    .custom-login h2 { color: var(--td-brand-color); margin: 0; font-size: 20px; }
    .custom-login p { margin: 0; color: var(--td-text-color-secondary); }
    .custom-login img { display: block; width: 208px; height: 208px; padding: 16px; background: white; border-radius: 16px; }
    .custom-login button { width: 100%; padding: 9px; color: inherit; background: var(--td-bg-color-container); border: 1px solid var(--td-component-border); border-radius: 6px; cursor: pointer; }
    .custom-login button:hover { background: var(--td-bg-color-container-hover); }
  </style><section class="custom-login"><h2>DEMO · 自定义 HTML</h2><p>本地演示，无需扫描</p><img alt="演示登录二维码"><p role="status" aria-live="polite"></p><button type="button">取消登录</button></section>`
  const image = ctx.root.querySelector<HTMLImageElement>('img')!
  const status = ctx.root.querySelector('[role="status"]')!
  const cancel = () => { void ctx.close() }
  ctx.root.querySelector('button')!.addEventListener('click', cancel)
  const unsubscribe = ctx.subscribe(state => {
    const login = state.login as AccountQrViewState | undefined
    if (login?.image) image.src = login.image
    status.textContent = login?.status === 'scanned' ? '已扫码，请在手机确认' : '等待扫码'
  })
  return () => { unsubscribe(); ctx.root.replaceChildren() }
})
