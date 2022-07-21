<script setup lang="ts">
import { h, ref, onMounted } from "vue";
import { Notification } from "@/types";

type Props = {
  notification: Notification;
  hideNotification?: boolean;
};

const props = defineProps<Props>();
const emits = defineEmits(["hide"]);
const isShowMore = ref(false);
const showSpan = ref(false);

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
    "data-testid": "message",
  });
};

const onToggle = () => {
  isShowMore.value = !isShowMore.value;
};

onMounted(() => {
  const container = document.getElementById(
    "notification-container"
  ) as HTMLElement;
  if (container.offsetHeight > 101) {
    showSpan.value = true;
    isShowMore.value = true;
  } else {
    showSpan.value = false;
    isShowMore.value = false;
  }
});
</script>

<template v-if="notification">
  <div
    id="notification-container"
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
      :class="{ ellipsis: isShowMore, 'no-ellipsis': !isShowMore }"
    />
    <span
      v-if="showSpan"
      class="span-btn"
      data-testid="show-more"
      @click="onToggle"
    >
      <span v-if="isShowMore">show more</span>
      <span v-else>show less</span>
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
