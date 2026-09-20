import { definePluginConfig } from '@shiqianjiang/ceru-plugin-sdk'

const losslessQualities = ['flac'] as const

export default definePluginConfig({
  displayName: 'Ceru Demo',
  apiOrigin: 'https://music.example.com',
  sources: {
    demo: {
      name: 'Demo Source',
      qualities: ['320k', ...losslessQualities],
    },
  },
})
