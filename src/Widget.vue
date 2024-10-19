<script setup lang="ts">
import { createClientUPProvider } from '@lukso/embedded-provider'
import { ref } from 'vue'
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
  console.log('accountChanged event', _accounts)
  accounts.value = _accounts
})
</script>

<template>
  <div>
    <section class="section">
      <h1 class="is-size-10 title">Content within Widget</h1>
    </section>
    <div class="container">
      <div class="notification is-danger" v-if="errors.length > 0">
        <button class="delete" @click="errors = []"></button>
        <pre v-for="(error, index) in errors" :key="index">{{ error.stack }}</pre>
      </div>
      <div class="columns">
        <div class="column">
          <div class="card">
            <div class="is-size-5 card-content">
              <p class="title is-size-5">Chain ID</p>
              <p class="subtitle is-size-5">{{ chainId }}</p>
            </div>
          </div>
        </div>
        <div class="column">
          <div v-for="address in accounts || []" :key="address" class="card">
            <div class="card-content">
              <p class="title is-size-5">Account</p>
              <p class="subtitle is-size-5">{{ address }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
