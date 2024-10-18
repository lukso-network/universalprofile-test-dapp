<script setup lang="ts">
import { TokenInfo } from '@/helpers/tokenUtils'
import { getState } from '@/stores'
import { getUPProviderChannel } from '@lukso/embedded-provider'
import { ref, watch } from 'vue'

type Props = {
  channel: ReturnType<typeof getUPProviderChannel>
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
  () =>
    [enabled.value, props.channel] as [
      boolean,
      ReturnType<typeof getUPProviderChannel>,
    ],
  ([value, channel]: [boolean, ReturnType<typeof getUPProviderChannel>]) => {
    if (channel) {
      channel.allowAccounts(
        [getState('address'), (pageAddress.value || '') as '' | `0x${string}`],
        getState('chainId')
      )
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
      <div class="field mt-4">
        <label class="checkbox">
          <input
            v-model="enabled"
            type="checkbox"
            :value="enabled"
            data-testid="isRecovery"
          />
          Recover the profile into your extension
        </label>
      </div>
    </div>
  </div>
</template>
