<script setup>
import {Button} from 'tdesign-vue-next'
import {useAction} from '@shiqianjiang/ceru-plugin-sdk/vue'
const open=useAction('open')
</script>
<template><Button @click="open()">音源搜索</Button></template>
