<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import { ref } from 'vue'
const uri = window.location.search.substring(1)
const params = new URLSearchParams(uri)
const showNav = ref<boolean>(params.get('hideNav') == undefined)
</script>

<template>
  <Navbar v-if="showNav" />

  <Suspense>
    <router-view></router-view>
  </Suspense>
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
