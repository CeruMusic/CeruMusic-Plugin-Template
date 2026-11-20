import { defineSurface } from '@shiqianjiang/ceru-plugin-sdk'

export default defineSurface(ctx => {
  const form = document.createElement('form')
  const label = document.createElement('label')
  const address = document.createElement('input')
  const connect = document.createElement('button')
  const status = document.createElement('p')
  label.textContent = '服务器地址'
  address.type = 'url'
  address.required = true
  label.append(address)
  connect.textContent = '演示连接'
  form.append(label, connect, status)
  form.onsubmit = async event => {
    event.preventDefault()
    connect.disabled = true
    try { await ctx.invoke('connection.connect', {serverUrl:address.value}) }
    catch (error) { status.textContent = String(error) }
    finally { connect.disabled = false }
  }
  ctx.root.replaceChildren(form)
  const off = ctx.subscribe(state => {
    if (typeof state.serverUrl === 'string') address.value = state.serverUrl
    if (typeof state.status === 'string') status.textContent = state.status
  })
  return () => { off(); ctx.root.replaceChildren() }
})
