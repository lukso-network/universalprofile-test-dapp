<script setup lang="ts">
defineProps<{ url: string }>();
</script>

<template>
  <div class="profile-image">
    <img v-src="url" />
  </div>
</template>
