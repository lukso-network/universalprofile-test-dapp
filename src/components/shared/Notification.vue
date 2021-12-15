<template>
  <div
    v-if="notification"
    class="notification card"
    :class="'is-' + notification.type"
    data-testid="notification"
  >
    <button class="delete" @click="hide" data-testid="hide"></button>
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
