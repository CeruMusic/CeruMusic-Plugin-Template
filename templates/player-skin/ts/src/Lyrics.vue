<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useHostComponents, useRegion } from '@shiqianjiang/ceru-plugin-sdk/vue/region'
const region = useRegion('player.lyrics')
const { props, actions } = region
const { AmlLyricPlayer } = useHostComponents()
const list = ref<HTMLElement>()
const active = computed(() => { for (let index = props.lines.length - 1; index >= 0; index--) if (props.lines[index].startTimeMs <= props.currentTime.value) return index; return -1 })
watch(active, async index => {
  await nextTick()
  list.value?.children[index]?.scrollIntoView({ block: 'nearest' })
}, { immediate: true })
</script>
<template>
  <div v-if="region.settings.useAml === true" class="aml-frame">
    <AmlLyricPlayer v-bind="props.forward" @line-click="actions.seek" />
  </div>
  <div v-else ref="list" class="lines" aria-label="歌词">
    <button v-for="(line, index) in props.lines" :key="index" type="button" :aria-current="active === index ? 'true' : undefined" @click="actions.seek(line.startTimeMs)">{{ line.text }}</button>
    <p v-if="!props.lines.length">暂无歌词</p>
  </div>
</template>
<style scoped>
.aml-frame { height: 100%; width: 100%; color: inherit }
.lines { height: 100%; box-sizing: border-box; overflow: auto; padding: 1rem; color: inherit }
button { display: block; width: 100%; border: 0; padding: .6em; background: transparent; color: inherit; font: inherit; text-align: start; opacity: .66; cursor: pointer }
button[aria-current] { opacity: 1; font-weight: 700; border-inline-start: 3px solid currentColor }
</style>
