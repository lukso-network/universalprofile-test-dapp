<script setup lang="ts">
import { createClientUPProvider } from '@lukso/up-provider'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { ref, watch } from 'vue'
import Web3 from 'web3'

const chainId = ref<number | null>(null)
const accounts = ref<string[]>([])
const contextAccounts = ref<string[]>([])
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
contextAccounts.value = window.lukso?.contextAccounts || []
console.log('Context accounts:', contextAccounts.value)
window.lukso?.on('accountsChanged', (_accounts: (`0x${string}` | '')[]) => {
  accounts.value = _accounts
})
window.lukso?.on(
  'contextAccountsChanged',
  (_accounts: (`0x${string}` | '')[]) => {
    contextAccounts.value = _accounts
  }
)
window.lukso?.on('chainChanged', (_chainId: number) => {
  chainId.value = _chainId
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
  const obj = {
    from: accounts.value[0],
    to: contextAccounts.value[0],
    value: amount.value?.toString() || '0',
  }
  console.log('Donating', obj)
  web3.value?.eth.sendTransaction(obj)
}
</script>

<template>
  <div style="width: 100%; max-width: 100vw">
    <section class="section">
      <h1 class="is-size-4 title">Content within Widget</h1>
    </section>

    <div class="container">
      <div v-if="errors.length > 0" class="notification is-danger">
        <button class="delete" @click="errors = []"></button>
        <pre v-for="(_error, index) in errors" :key="index">{{
          _error.stack
        }}</pre>
      </div>
    </div>

    <div class="box" style="width: 100%; max-width: 100vw">
      <!-- Chain Field -->
      <div class="field">
        <label class="label">Chain</label>
        <div class="control">
          <input
            class="input is-static"
            type="text"
            :value="chainId"
            readonly
          />
        </div>
      </div>

      <!-- Account Fields -->
      <div
        v-for="(address, index) in accounts || []"
        :key="address"
        class="field"
      >
        <label class="label">Account[{{ index }}]</label>
        <div class="control">
          <!-- Ensure long addresses wrap correctly on narrow screens -->
          <input
            class="input is-static"
            type="text"
            :value="address"
            readonly
            style="white-space: nowrap; overflow-x: auto; word-wrap: break-word"
          />
        </div>
      </div>
      <div
        v-for="(address, index) in contextAccounts || []"
        :key="address"
        class="field"
      >
        <label class="label">ContextAccount[{{ index }}]</label>
        <div class="control">
          <!-- Ensure long addresses wrap correctly on narrow screens -->
          <input
            class="input is-static"
            type="text"
            :value="address"
            readonly
            style="white-space: nowrap; overflow-x: auto; word-wrap: break-word"
          />
        </div>
      </div>

      <!-- Amount Input and Button -->
      <div class="field is-grouped is-grouped-right is-flex-wrap-wrap">
        <p class="control is-expanded">
          <input
            v-model="amountText"
            class="input"
            type="text"
            placeholder="Enter amount"
          />
        </p>
        <p class="control">
          <!-- Ensure button takes full width on small screens -->
          <button
            class="button is-primary is-rounded is-fullwidth"
            type="submit"
            :class="{ 'is-loading': false }"
            :disabled="false"
            data-testid="upload-button"
            @click.stop="donate"
          >
            Donate
          </button>
        </p>
      </div>

      <p v-if="error" class="help is-danger has-background-white">
        {{ error }}
      </p>
    </div>
  </div>
</template>
