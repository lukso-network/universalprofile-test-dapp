<script setup lang="ts">
import { ref } from 'vue'

const base = ref<string>(import.meta.env.BASE_URL || '/')
const frameElement = ref<HTMLIFrameElement | null>(null)
function matchSize() {
  if (!frameElement.value) {
    return
  }
  frameElement.value.width = `${window.innerWidth - frameElement.value.offsetLeft}px`
  frameElement.value.height = `${window.innerHeight - frameElement.value.offsetTop - 20}px`
}
window.addEventListener('resize', matchSize)
window.addEventListener('load', matchSize)
</script>

<template>
  <div class="has-background-white">
    <section class="section">
      <h1 class="title is-large">Content within EIP-5593 iframe</h1>
    </section>
    <iframe
      ref="frameElement"
      scrolling="yes"
      :src="base + '?hideNav=true'"
      sandbox="allow-same-origin allow-scripts"
      @load="matchSize"
    ></iframe>
  </div>
</template>
