<script setup lang="ts">
import SendLyx from "@/components/endpoints/SendLyx.vue";
import Accounts from "@/components/endpoints/Accounts.vue";
</script>

<template>
  <section class="section">
    <div class="tile is-ancestor">
      <Accounts />
      <SendLyx />
    </div>
  </section>
</template>
