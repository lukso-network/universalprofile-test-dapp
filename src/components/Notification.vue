<script setup lang="ts">
import { Notification } from "@/types";
import { h } from "vue";

type Props = {
  notification: Notification;
  hideNotification?: boolean;
};

const props = defineProps<Props>();
const emits = defineEmits(["hide"]);

const hide = () => {
  emits("hide");
};

const renderMessage = () => {
  const text = new DOMParser().parseFromString(
    props.notification.message as string,
    "text/html"
  ).body.innerHTML;
  return h("div", {
    innerHTML: text,
  });
};
</script>

<template>
  <div
    v-if="notification"
    class="notification card"
    :class="'is-' + notification.type"
    data-testid="notification"
  >
    <button
      v-if="!hideNotification"
      class="delete"
      data-testid="hide"
      @click="hide"
    ></button>
    <render-message />
  </div>
</template>

<style scoped lang="scss">
.notification {
  word-break: break-all;
}
</style>
