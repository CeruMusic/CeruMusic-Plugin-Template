import { useState, useEffect } from 'react'
import type { SurfaceContext } from '@shiqianjiang/ceru-plugin-sdk'
export default function App({ context }: { context: SurfaceContext }) {
  const [count, setCount] = useState(0)
  const [icon, setIcon] = useState('')
  useEffect(() => {
    let active = true
    context.icons.url('platform.tx').then((url) => {
      if (active) setIcon(url)
    })
    return () => {
      active = false
    }
  }, [context])
  return (
    <main style={{ padding: 28, fontFamily: 'system-ui', color: '#173b28' }}>
      <img src={icon} width={48} />
      <h1>React 插件页面</h1>
      <p>{context.utils.lodash.startCase('host utilities ready')}</p>
      <button onClick={() => setCount(count + 1)}>计数 {count}</button>
    </main>
  )
}
