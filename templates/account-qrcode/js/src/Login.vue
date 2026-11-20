<script setup >
import { Button } from 'tdesign-vue-next'
import { useView, useViewState } from '@shiqianjiang/ceru-plugin-sdk/vue'

const bridge = useView()
const state = useViewState()
</script>
<template>
  <section class="login-content">
    <div class="brand">DEMO · 扫码登录</div>
    <p>这是本地演示二维码，无需使用手机扫描。</p>
    <div class="code"><img :src="state.login?.image" width="208" height="208" alt="演示登录二维码" /></div>
    <p class="status" role="status" aria-live="polite">{{ state.login?.status === 'scanned' ? '已扫码，请在手机确认' : '等待扫码' }}</p>
    <Button block variant="outline" @click="bridge.close()">取消登录</Button>
  </section>
</template>
<style scoped>
.login-content { display: grid; justify-items: center; gap: 16px; padding: 8px; color: var(--td-text-color-primary); }
.brand { font-size: 20px; font-weight: 600; color: var(--td-brand-color); }
p { margin: 0; color: var(--td-text-color-secondary); font-size: 13px; }
.code { padding: 16px; background: white; border-radius: 16px; }
img { display: block; }
.status { min-height: 22px; }
.login-content > :last-child { justify-self: stretch; }
</style>
