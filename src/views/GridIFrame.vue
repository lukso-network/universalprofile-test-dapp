<script setup lang="ts">
import Accounts from '@/components/endpoints/Accounts.vue'
import GridPanelDialog from '@/components/grid/GridPanelDialog.vue'
import { computed, ref } from 'vue'
import Notifications from '@/components/Notification.vue'
import { UPClientChannel, createUPProviderConnector } from '@lukso/up-provider'

const globalProvider = createUPProviderConnector()
globalProvider.on('channelCreated', () => {})

const base = ref<string>(import.meta.env.BASE_URL || '/')

const frame1Channel = ref<UPClientChannel | null>(null)
const frame2Channel = ref<UPClientChannel | null>(null)
const frame1Ref = ref<HTMLIFrameElement | null>(null)
const frame2Ref = ref<HTMLIFrameElement | null>(null)

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
    <section class="section">
      <h1 class="title is-large">Content within Grid iframe</h1>
      <div class="tile is-ancestor">
        <Accounts />
        <GridPanelDialog :channel="frame1Channel" :frame="frame1Ref" />
        <div class="tile is-parent">
          <div class="tile is-child box">
            <iframe
              id="frame1"
              ref="frame1Ref"
              :src="base + 'widget.html'"
              sandbox="allow-same-origin allow-scripts"
              width="100%"
              height="600px"
              @up-channel-connected="upChannelConnected"
            />
          </div>
        </div>
      </div>
      <div class="tile is-ancestor">
        <div class="tile is-4">&nbsp;</div>
        <GridPanelDialog :channel="frame2Channel" :frame="frame2Ref" />
        <div class="tile is-parent">
          <div class="tile is-child box">
            <iframe
              id="frame2"
              ref="frame2Ref"
              src="https://widget-example.lukso.dev"
              sandbox="allow-same-origin allow-scripts"
              width="100%"
              height="600px"
              @up-channel-connected="upChannelConnected"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
