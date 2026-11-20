<script setup>
import { ref } from 'vue'
import { Button, Input } from 'tdesign-vue-next'
import { useAction, useHostComponents, useViewState } from '@shiqianjiang/ceru-plugin-sdk/vue'
const query = ref(''),
  pending = ref(false),
  error = ref('')
const search = useAction('search')
const state = useViewState()
const { SongList, PageHeader, EmptyState, LoadingState } = useHostComponents()
const actions = { play: 'play', enqueue: 'enqueue' }
async function submit() {
  if (pending.value) return
  pending.value = true
  error.value = ''
  try {
    await search(query.value)
  } catch (reason) {
    error.value = String(reason)
  } finally {
    pending.value = false
  }
}
</script>
<template>
  <section>
    <PageHeader title="音源搜索" description="搜索歌曲，或把结果加入播放队列。" />
    <div class="search-bar" role="search">
      <Input v-model="query" aria-label="歌曲名称" placeholder="输入歌曲名称" @enter="submit" />
      <Button type="button" :disabled="pending" @click="submit">搜索</Button>
    </div>
    <p v-if="error" role="alert">{{ error }}</p>
    <LoadingState v-if="pending" title="正在搜索…" />
    <SongList v-else-if="state.items?.length" :items="state.items" :actions="actions" />
    <EmptyState
      v-else
      :title="state.searched ? '没有找到歌曲' : '搜索你的第一首歌'"
      :description="
        state.searched ? '换个关键词，或检查音源是否已启用。' : '启用的音源和本地曲库均可用于搜索。'
      "
    />
  </section>
</template>
<style scoped>
section {
  padding: 16px;
  display: grid;
  gap: 12px;
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-bar > :first-child {
  flex: 1;
  min-width: 0;
}
[role='alert'] {
  color: var(--td-error-color);
}
</style>
