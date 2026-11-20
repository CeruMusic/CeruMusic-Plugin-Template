<script setup >
import { useHostComponents, useRegion } from '@shiqianjiang/ceru-plugin-sdk/vue/region'
const { props } = useRegion('player.artwork')
const { VinylRecord, SquareCover } = useHostComponents()
</script>
<template>
  <VinylRecord v-if="props.layout === 'cd'" :artwork="props.artwork" :track="props.track" :palette="props.palette" :playing="props.playing.value" />
  <SquareCover v-else :artwork="props.artwork" :track="props.track" :palette="props.palette" :playing="props.playing.value" />
</template>
