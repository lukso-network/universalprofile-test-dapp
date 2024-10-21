<script setup lang="ts">
import { createClientUPProvider } from '@lukso/embedded-provider'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { ref, watch } from 'vue'
import Web3 from 'web3'

const chainId = ref<number | null>(null)
const accounts = ref<string[]>([])
const errors = ref<Error[]>([])
const web3 = ref<Web3>()

window.lukso = createClientUPProvider()

web3.value = new Web3(window.lukso)
window.web3 = web3.value
web3.value.eth
  ?.getChainId()
  .then(_chainId => {
    chainId.value = _chainId
  })
  .catch(error => {
    // Ignore error
    errors.value.push(error)
  })
web3.value.eth
  ?.getAccounts()
  .then(_accounts => {
    accounts.value = _accounts
  })
  .catch(error => {
    // Ignore error
    errors.value.push(error)
  })
window.lukso?.on('accountsChanged', (_accounts: (`0x${string}` | '')[]) => {
  accounts.value = _accounts
})
const amountText = ref<string>()
const amount = ref<BigNumber>()
const error = ref<string | null>(null)
watch(
  () => [amountText.value, ...accounts.value],
  () => {
    if (!accounts.value || !accounts.value[0] || !accounts.value[1]) {
      error.value = 'Please connect first.'
      return
    }
    if (accounts.value[0] === accounts.value[1]) {
      error.value = 'You cannot donate to yourself.'
      return
    }
    try {
      error.value = null
      amount.value = parseUnits(amountText.value || '0', 18)
    } catch (err) {
      error.value = (err as { message: string }).message
    }
  }
)
function donate() {
  web3.value?.eth.sendTransaction({
    from: accounts.value[0],
    to: accounts.value[1],
    value: amount.value?.toString() || '0',
  })
}
</script>

<template>
  <div style="width: 100%; max-width: 100vw">
    <section class="section">
      <h1 class="is-size-10 title">Content within Widget</h1>
    </section>
    <div class="container">
      <div class="notification is-danger" v-if="errors.length > 0">
        <button class="delete" @click="errors = []"></button>
        <pre v-for="(error, index) in errors" :key="index">{{ error.stack }}</pre>
      </div>
      <div class="box" style="width: 100%; max-width: 100vw">
        <!-- Chain Field -->
        <div class="field">
          <label class="label">Chain</label>
          <div class="control">
            <input class="input is-static" type="text" :value="chainId" readonly />
          </div>
        </div>
        <!-- Account0 Field -->
        <div v-for="(address, index) in accounts || []" :key="address" class="field">
          <label class="label">Account[{{ index }}]</label>
          <div class="control">
            <input class="input is-static" type="text" :value="address" readonly />
          </div>
        </div>
        <div class="field is-grouped is-grouped-right">
          <p class="control">
            <input v-model="amountText" class="input" type="text" placeholder="Enter amount" />
          </p>
          <p class="control">
            <button class="button is-primary is-rounded" type="submit" :class="{ 'is-loading': false }" :disabled="false" data-testid="upload-button" @click.stop="donate">Donate</button>
          </p>
        </div>
        <p class="help is-danger has-background-white" v-if="error">
          {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>
