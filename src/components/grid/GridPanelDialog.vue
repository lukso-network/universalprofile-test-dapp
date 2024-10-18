<script setup lang="ts">
import { TokenInfo } from '@/helpers/tokenUtils'
import { getUPProviderChannel } from '@lukso/embedded-provider'
import { ref } from 'vue'

type Props = {
  channel: ReturnType<typeof getUPProviderChannel>
}

defineProps<Props>()
const pageAddress = ref<string>()
function handlePageAddress(info: TokenInfo) {
  if (info.address) {
    pageAddress.value = info.address
  }
}
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
    </div>
  </div>
</template>
