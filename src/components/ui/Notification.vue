<template>
  <div class="notification card" :class="'is-' + notification.type">
    <button class="delete" @click="hide"></button>
    {{ notification.message }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UiNotification",
  props: {
    notification: {
      type: Object,
    },
  },
  data() {
    return {
      isVisible: true,
    };
  },

  methods: {
    hide() {
      this.$emit("hide");
    },
  },
});
</script>
