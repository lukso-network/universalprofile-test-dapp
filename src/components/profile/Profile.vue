<template>
  <div class="user">
    <h2>Profile Component {{ $route.params.address }}</h2>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Profile",
  props: {
    msg: String,
  },
  setup: async function () {
    return {
      data: "wooohoooo",
    };
  },
});
</script>

<style></style>
