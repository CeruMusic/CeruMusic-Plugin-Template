<script setup lang="ts">
import { computed } from 'vue'
import { useHostComponents, useRegion } from '@shiqianjiang/ceru-plugin-sdk/vue/region'
const region = useRegion('player.background')
const { ShaderBackground } = useHostComponents()
const background = computed(() => region.props.palette.background)
const accent = computed(() => typeof region.settings.accent === 'string' ? region.settings.accent : region.props.palette.accent)
const border = computed(() => region.settings.showAccent === false ? 'none' : 'solid')
</script>
<template>
  <div class="backdrop" :style="{ color: accent, borderBlockEndStyle: border }" aria-hidden="true">
    <ShaderBackground :artwork="region.props.artwork" :track="region.props.track" :palette="region.props.palette" :playing="region.props.playing.value" />
  </div>
</template>
<style scoped>.backdrop { position: absolute; inset: 0; border-block-end: .35rem solid currentColor; pointer-events: none; background-color: v-bind(background) } .backdrop :deep(.ceru-hc-background) { position: absolute; inset: 0; opacity: .78 }</style>
