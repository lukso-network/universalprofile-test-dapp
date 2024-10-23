<script setup lang="ts">
import { TokenInfo } from '@/helpers/tokenUtils'
import { getState } from '@/stores'
import { createUPProviderConnector, getUPProviderChannel, UPClientChannel } from '@lukso/embedded-provider'
import { ref, toRaw, watch } from 'vue'
import LSPSelect from '@/components/shared/LSPSelect.vue'

type Props = {
  channel?: UPClientChannel | null
}

const globalProvider = createUPProviderConnector()
const props = defineProps<Props>()
const pageAddress = ref<string>(getState('address'))
const enabled = ref<boolean>(false)
function handlePageAddress(info: TokenInfo) {
  if (info.address) {
    pageAddress.value = info.address
  }
}
function updateProvider() {
  // You can either use the proxy object as a search argument
  const channel = getUPProviderChannel(props.channel || null)
  if (channel) {
    // or always call toRaw on the proxy object. Either or both will work, but the raw proxy methods will throw errors
    toRaw(channel).allowAccounts(enabled.value, [getState('address'), pageAddress.value], getState('chainId'))
  }
}
globalProvider.on('channelCreated', updateProvider)
watch(() => () => getState('chainId'), updateProvider, { immediate: true })
watch(() => enabled.value, updateProvider)
watch(() => props.channel, updateProvider)
watch(() => pageAddress.value, updateProvider)
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Grid Control</p>
      <div class="field">
        <label class="label">Token address</label>
        <LSPSelect :address="pageAddress" :show-accounts="true" @option-selected="handlePageAddress" />
        <div class="control">
          <input v-model="pageAddress" class="input is-family-code" type="text" data-testid="transfer-address" />
        </div>
      </div>
      <div class="field mt-4">
        <label class="checkbox">
          <input v-model="enabled" type="checkbox" :value="enabled" data-testid="isRecovery" />
          Enable connection
        </label>
      </div>
    </div>
  </div>
</template>
