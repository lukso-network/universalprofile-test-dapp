<template>
  <div
    v-if="notification"
    class="notification card"
    :class="'is-' + notification.type"
  >
    <button class="delete" @click="hide"></button>
    {{ notification.message }}
  </div>
</template>

<script setup lang="ts">
import { Notification } from "@/types";

defineProps<{ notification: Notification }>();
const emits = defineEmits(["hide"]);

const hide = () => {
  emits("hide");
};
</script>
