import { defineSurface } from '@shiqianjiang/ceru-plugin-sdk'

export default defineSurface((ctx) => {
  const heading = document.createElement('h1')
  heading.textContent =
    ctx.mount.kind === 'slot'
      ? `Injected into ${ctx.mount.slot} (${ctx.mount.mode})`
      : 'Hello from an isolated Ceru Surface'
  ctx.root.replaceChildren(heading)
  return () => ctx.root.replaceChildren()
})
