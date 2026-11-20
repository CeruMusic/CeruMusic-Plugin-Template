import { definePlugin } from '@shiqianjiang/ceru-plugin-sdk'
import { installDemo } from './demo.ts'

export default definePlugin((ctx) => installDemo(ctx))
