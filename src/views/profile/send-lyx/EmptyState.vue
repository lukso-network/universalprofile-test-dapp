<template name="EmptyState">
  <div class="card-content" data-testid="empty-state">
    <div
      class="
        notification
        is-info is-light is-flex is-flex-direction-column
        pr-5
        has-text-centered
      "
    >
      You need Browser Extension for sending LYX.
      <button
        class="button is-info is-rounded mt-4"
        @click="installExtension"
        data-testid="button"
      >
        Install Browser Extension
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const installExtension = () => {
  // ! TODO link to extension install
  const w = window.open(
    "https://chrome.google.com/webstore/category/extensions?hl=en",
    "_blank"
  );

  if (w) {
    w.focus();
  }

  return false;
};
</script>
