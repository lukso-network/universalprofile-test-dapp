<script setup lang="ts">
import { Notification } from "@/types";

defineProps<{ notification: Notification }>();
const emits = defineEmits(["hide"]);

const hide = () => {
  emits("hide");
};
</script>

<template>
  <div
    v-if="notification"
    class="notification card"
    :class="'is-' + notification.type"
    data-testid="notification"
  >
    <button class="delete" data-testid="hide" @click="hide"></button>
    {{ notification.message }}
  </div>
</template>

<style scoped lang="scss">
.notification {
  word-break: break-all;
}
</style>
