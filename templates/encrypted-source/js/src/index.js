import { definePlugin } from '@shiqianjiang/ceru-plugin-sdk'
import { installDemo } from './demo.js'

export default definePlugin((ctx) => installDemo(ctx))
