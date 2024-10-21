<script setup lang="ts">
import Accounts from '@/components/endpoints/Accounts.vue'
import GridPanelDialog from '@/components/grid/GridPanelDialog.vue'
import { computed, ref } from 'vue'
import Notifications from '@/components/Notification.vue'
import { UpClientChannel, createGlobalUPProvider } from '@lukso/embedded-provider'

const globalProvider = createGlobalUPProvider()
globalProvider.on('channelCreated', () => {})

const base = ref<string>(import.meta.env.BASE_URL || '/')
console.log(base, import.meta.env)

const frame1Channel = ref<UpClientChannel | null>(null)
const frame2Channel = ref<UpClientChannel | null>(null)

const hasExtension = computed(() => !!window.lukso)

function upChannelConnected(e: CustomEvent) {
  const { channel } = e.detail
  const iframe = e.target as HTMLIFrameElement
  switch (iframe.id) {
    case 'frame1':
      frame1Channel.value = channel
      break
    case 'frame2':
      frame2Channel.value = channel
      break
  }
}
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
        <GridPanelDialog :channel="frame1Channel" />
        <iframe id="frame1" scrolling="yes" :src="base + 'widget.html'" sandbox="allow-same-origin allow-scripts" width="100%" height="600px" @up-channel-connected="upChannelConnected" />
      </div>
      <div class="tile is-ancestor">
        <div class="tile is-4">&nbsp;</div>
        <GridPanelDialog :channel="frame2Channel" />
        <iframe id="frame2" scrolling="yes" :src="base + 'widget.html'" sandbox="allow-same-origin allow-scripts" width="100%" height="600px" @up-channel-connected="upChannelConnected" />
      </div>
    </section>
  </div>
</template>
