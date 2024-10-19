<script setup lang="ts">
import { TokenInfo } from '@/helpers/tokenUtils'
import { getState } from '@/stores'
import { getUPProviderChannel } from '@lukso/embedded-provider'
import { Ref, ref, watch } from 'vue'
import LSPSelect from '@/components/shared/LSPSelect.vue'

type Props = {
  channel: { ref: Ref<HTMLIFrameElement | null> }
}

const props = defineProps<Props>()
const pageAddress = ref<string>()
const enabled = ref<boolean>(false)
function handlePageAddress(info: TokenInfo) {
  if (info.address) {
    pageAddress.value = info.address
  }
}
watch(
  () => [enabled.value, props.channel.ref.value] as [boolean, HTMLIFrameElement | null],
  ([value, _channel]: [boolean, HTMLIFrameElement | null]) => {
    const channel = getUPProviderChannel(_channel)
    console.log(value, channel, channel?.enabled || false)
    if (channel) {
      channel.allowAccounts([getState('address'), (pageAddress.value || '') as '' | `0x${string}`], getState('chainId'))
      channel.enabled = value
    }
  }
)
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
