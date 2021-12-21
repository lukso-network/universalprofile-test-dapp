<template>
  <Navbar />

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

<script setup lang="ts">
import Navbar from "@/components/Navbar.vue";
</script>
