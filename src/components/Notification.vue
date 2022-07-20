<script setup lang="ts">
import { Notification } from "@/types";
import { h, ref, onMounted } from "vue";
type Props = {
  notification: Notification;
  hideNotification?: boolean;
};

const props = defineProps<Props>();
const emits = defineEmits(["hide"]);
const isShowMore = ref(false);
const showSpan = ref(false);
const offsetHeight = ref(0);

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
const onToggle = () => {
  isShowMore.value = !isShowMore.value;
};
onMounted(() => {
  if (offsetHeight.value > 101) {
    showSpan.value = true;
    isShowMore.value = true;
  } else {
    showSpan.value = false;
    isShowMore.value = false;
  }
});
</script>

<template>
  <div
    v-if="notification"
    :ref="(el) => (offsetHeight = (el as HTMLDivElement)?.offsetHeight)"
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
    <span v-if="showSpan" class="span-btn" @click="onToggle">
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
