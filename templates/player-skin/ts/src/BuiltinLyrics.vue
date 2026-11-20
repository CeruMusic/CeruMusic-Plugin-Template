<script setup lang="ts">
import { useHostComponents, useRegion } from '@shiqianjiang/ceru-plugin-sdk/vue/region'
const { LyricAdapter, AmlLyricPlayer } = useHostComponents()
const region = useRegion('player.lyrics')
const { props, actions } = region
</script>
<template>
  <div class="lyrics-region">
    <component v-if="props.lines.length" :is="region.settings.useAml === true ? AmlLyricPlayer : LyricAdapter" v-bind="props.forward" @line-click="actions.seek" />
    <p v-else>暂无歌词</p>
  </div>
</template>
<style scoped>
.lyrics-region { height: 100%; color: v-bind('props.palette.foreground'); }
</style>
