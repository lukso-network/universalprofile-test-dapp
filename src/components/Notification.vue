<script setup lang="ts">
import { Notification } from "@/types";
import { computed, h, ref } from "vue";
type Props = {
  notification: Notification;
  hideNotification?: boolean;
};

const props = defineProps<Props>();
const emits = defineEmits(["hide"]);
const isShowMore = ref(false);

const hide = () => {
  emits("hide");
};

const isMaxMessageLength = computed(() => {
  if (props.notification?.message) {
    return props.notification?.message.length >= 300;
  }
  return false;
});

const renderMessage = () => {
  const text = new DOMParser().parseFromString(
    props.notification.message as string,
    "text/html"
  ).body.innerHTML;
  return h("div", {
    innerHTML: text,
  });
};
const onToggle = () => {
  isShowMore.value = !isShowMore.value;
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
    <render-message
      :class="{ ellipsis: !isShowMore, 'no-ellipsis': isShowMore }"
    >
    </render-message>
    <span v-if="isMaxMessageLength" class="span-btn" @click="onToggle">
      <span v-if="isShowMore">show less</span>
      <span v-else>show more</span>
    </span>
  </div>
</template>

<style scoped lang="scss">
.notification {
  word-break: break-all;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.no-ellipsis {
  overflow: visible;
  text-overflow: visible;
  white-space: normal;
}
.span-btn {
  cursor: pointer;
  border: 1px solid rgb(231, 198, 198);
  padding: 2px 4px;
  border-radius: 3px;
  margin: 3px 0px;
  display: inline-block;
}
</style>
