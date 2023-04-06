<script setup lang="ts">
import { ref } from 'vue'

const base = ref<string>(import.meta.env.BASE_URL || '/')
</script>

<template>
  <iframe
    width="1080"
    height="800"
    :src="base + '?hideNav=true'"
    sandbox="allow-same-origin allow-scripts"
  ></iframe>
</template>
