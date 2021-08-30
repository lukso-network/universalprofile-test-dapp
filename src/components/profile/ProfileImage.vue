<template>
  <div class="profile-image">
    <img v-src="url" />
  </div>
</template>

<script>
export default {
  props: {
    url: String,
  },
};
</script>

<style></style>
