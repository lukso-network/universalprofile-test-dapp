<script setup lang="ts">
import { TokenInfo } from '@/helpers/tokenUtils'
import { getState } from '@/stores'
import {
  createUPProviderConnector,
  getUPProviderChannel,
  UPClientChannel,
} from '@lukso/up-provider'
import { ref, toRaw, watch } from 'vue'
import LSPSelect from '@/components/shared/LSPSelect.vue'

type Props = {
  channel?: UPClientChannel | null
  frame?: HTMLIFrameElement | null
}

const globalProvider = createUPProviderConnector()
const props = defineProps<Props>()
const pageAddress = ref<string>(getState('address'))
const enabled = ref<boolean>(false)
const url = ref<string>('')
function handlePageAddress(info: TokenInfo) {
  if (info.address) {
    pageAddress.value = info.address
  }
}
watch(
  () => props.frame,
  (frame, oldFrame) => {
    if (frame !== oldFrame) {
      url.value = frame?.src || ''
    }
  }
)
function updateProvider() {
  // You can either use the proxy object as a search argument
  const channel = getUPProviderChannel(props.channel || null)
  if (channel) {
    // or always call toRaw on the proxy object. Either or both will work, but the raw proxy methods will throw errors
    toRaw(channel).setupChannel(
      enabled.value,
      [getState('address')],
      pageAddress.value ? [pageAddress.value as `0x${string}`] : [],
      getState('chainId')
    )
  }
}
globalProvider.on('channelCreated', updateProvider)
watch(() => () => getState('chainId'), updateProvider, { immediate: true })
watch(() => enabled.value, updateProvider)
watch(() => props.channel, updateProvider)
watch(() => pageAddress.value, updateProvider)
function gotoPage() {
  if (props.frame) {
    const frame: HTMLIFrameElement | null = props.frame || null
    if (frame) {
      frame.src = url.value
    }
  }
}
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Grid Control</p>
      <div class="field">
        <label class="label">Page address</label>
        <LSPSelect
          :address="pageAddress"
          :show-accounts="true"
          @option-selected="handlePageAddress"
        />
        <div class="control">
          <input
            v-model="pageAddress"
            class="input is-family-code"
            type="text"
            data-testid="transfer-address"
          />
        </div>
      </div>
      <label class="label">Widget url</label>
      <div class="field has-addons">
        <div class="control is-expanded">
          <input v-model="url" class="input is-family-code" type="text" />
        </div>
        <div class="control">
          <button class="button is-primary" @click="gotoPage">Go</button>
        </div>
      </div>
      <div class="field mt-4">
        <label class="checkbox">
          <input
            v-model="enabled"
            type="checkbox"
            :value="enabled"
            data-testid="isRecovery"
          />
          Enable connection
        </label>
      </div>
    </div>
  </div>
</template>
