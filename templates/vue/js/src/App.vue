<script setup>
import { ref, onMounted } from 'vue'
const props = defineProps(['context'])
const count = ref(0)
const icon = ref('')
onMounted(async () => {
  icon.value = await props.context.icons.url('platform.tx')
})
</script>
<template>
  <main>
    <img :src="icon" width="48" />
    <h1>Vue 插件页面</h1>
    <p>编辑 src/App.vue，保存后自动重载。</p>
    <button @click="count++">计数 {{ count }}</button>
  </main>
</template>
<style scoped>
main {
  padding: 28px;
  font: 16px system-ui;
  color: #173b28;
}
button {
  padding: 10px 18px;
  border: 0;
  border-radius: 8px;
  background: #a6dfb7;
  cursor: pointer;
}
</style>
