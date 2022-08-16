<script lang="ts">
import Deployment from '@/components/deployment/Deployment.vue'

export default {
  name: 'Deployment',
  components: {
    Deployment,
  },
}
</script>

<template>
  <section class="section">
    <h1>Master Contract Deployment</h1>
    <p>TBD</p>
    <Suspense>
      <Deployment></Deployment>
    </Suspense>
  </section>
</template>
