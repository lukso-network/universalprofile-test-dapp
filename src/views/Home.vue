<script setup lang="ts">
import { computed } from 'vue'

import SendLyx from '@/components/endpoints/SendLyx.vue'
import Accounts from '@/components/endpoints/Accounts.vue'
import SetData from '@/components/endpoints/SetData.vue'
import Permissions from '@/components/endpoints/Permissions.vue'
import Assets from '@/components/endpoints/Assets.vue'
import Sign from '@/components/endpoints/Sign.vue'
import CustomRelayer from '@/components/endpoints/CustomRelayer.vue'
import Notifications from '@/components/Notification.vue'
import ImportProfile from '@/components/endpoints/ImportProfile.vue'

const hasExtension = computed(() => {
  return window.ethereum
})
</script>

<template>
  <section class="section">
    <Notifications
      v-if="!hasExtension"
      :notification="{
        message: 'Please instal Universal Profile browser extension.',
        type: 'warning',
      }"
      :hide-notification="true"
      class="mb-4"
    ></Notifications>
    <div class="tile is-ancestor">
      <Accounts />
      <SendLyx />
      <SetData />
    </div>
    <div class="tile is-ancestor">
      <Permissions />
      <Assets />
      <Sign />
    </div>
    <div class="tile is-ancestor">
      <CustomRelayer />
      <ImportProfile />
    </div>
  </section>
</template>
