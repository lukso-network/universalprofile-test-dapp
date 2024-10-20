<script setup lang="ts">
import Accounts from '@/components/endpoints/Accounts.vue'
import GridPanelDialog from '@/components/grid/GridPanelDialog.vue'
import { computed, ref } from 'vue'
import Notifications from '@/components/Notification.vue'
import { createGlobalUPProvider } from '@lukso/embedded-provider'

const globalProvider = createGlobalUPProvider()
globalProvider.on('channelCreated', () => {})

const base = ref<string>(import.meta.env.BASE_URL || '/')
console.log(base, import.meta.env)

const frameElement = ref<HTMLIFrameElement | null>(null)
const frameElement2 = ref<HTMLIFrameElement | null>(null)

const hasExtension = computed(() => !!window.lukso)
</script>

<template>
  <div class="has-background-white">
    <Notifications
      v-if="!hasExtension"
      :notification="{
        message: 'Please install Universal Profile browser extension.',
        type: 'warning',
      }"
      :hide-notification="true"
      class="mb-4"
    ></Notifications>
    <section class="title">
      <h1 class="title is-large">Content within Grid iframe</h1>
    </section>
    <section class="section">
      <div class="tile is-ancestor">
        <Accounts />
        <GridPanelDialog :frame="frameElement" />
        <iframe ref="frameElement" scrolling="yes" :src="base + 'widget.html'" sandbox="allow-same-origin allow-scripts" width="100%" height="600px"></iframe>
      </div>
      <div class="tile is-ancestor">
        <div class="tile is-4">&nbsp;</div>
        <GridPanelDialog :frame="frameElement2" />
        <iframe ref="frameElement2" scrolling="yes" :src="base + 'widget.html'" sandbox="allow-same-origin allow-scripts" width="100%" height="600px"></iframe>
      </div>
    </section>
  </div>
</template>
