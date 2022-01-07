<script setup lang="ts">
import SendLyx from "@/components/endpoints/SendLyx.vue";
import Accounts from "@/components/endpoints/Accounts.vue";
import SetData from "@/components/endpoints/SetData.vue";
import Permissions from "@/components/endpoints/Permissions.vue";
// import Assets from "@/components/endpoints/Assets.vue";
// import Execute from "@/components/endpoints/Execute.vue";
</script>

<template>
  <section class="section">
    <div class="tile is-ancestor">
      <Accounts />
      <SendLyx />
      <SetData />
    </div>
    <div class="tile is-ancestor">
      <Permissions />
      <!-- <Assets /> -->
      <!-- <Execute /> -->
    </div>
  </section>
</template>
