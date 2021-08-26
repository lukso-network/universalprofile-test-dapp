<template>
  <div class="about">
    <Upload msg="Welcome to Your Vue.js + TypeScript App" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Upload from "@/components/Upload.vue"; // @ is an alias to /src

export default defineComponent({
  name: "Home",
  components: {
    Upload,
  },
});
</script>
