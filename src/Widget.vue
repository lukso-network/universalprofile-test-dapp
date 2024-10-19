<script setup lang="ts">
import { createClientUPProvider } from '@lukso/embedded-provider'
import { onMounted, ref } from 'vue'
import Web3 from 'web3'

const chainId = ref<number | null>(null)
const accounts = ref<string[]>([])
const errors = ref<Error[]>([])
const web3 = ref<Web3>()

onMounted(async () => {
  window.lukso = await createClientUPProvider()

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
})
</script>

<template>
  <div class="has-background-white">
    <section class="section">
      <h1 class="title is-large">Content within Widget</h1>
    </section>
    <div class="container">
      <div class="notification is-danger" v-if="errors.length > 0">
        <button class="delete" @click="errors = []"></button>
        <pre v-for="(error, index) in errors" :key="index">{{ error.stack }}</pre>
      </div>
      <div class="columns">
        <div class="column">
          <div class="card">
            <div class="card-content">
              <p class="title">Chain ID</p>
              <p class="subtitle">{{ chainId }}</p>
            </div>
          </div>
        </div>
        <div class="column">
          <div v-for="address in accounts || []" :key="address" class="card">
            <div class="card-content">
              <p class="title">Account</p>
              <p class="subtitle">{{ address }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
html {
  background-color: #f2f2f2 !important;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
