import { createRoot } from 'react-dom/client'
import { defineSurface } from '@shiqianjiang/ceru-plugin-sdk'
import App from './App'
export default defineSurface((ctx) => {
  const root = createRoot(ctx.root)
  root.render(<App context={ctx} />)
  return () => root.unmount()
})
