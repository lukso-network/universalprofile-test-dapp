<script setup lang="ts">
const getNetworkId = async () => {
  const id = await window.ethereum.request({ method: 'eth_getId' })
  //@ts-ignore
  document.getElementById('getNetId').innerHTML = id
}
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Get Network ID</p>
      <div class="field">
        <div class="is-one-third mb-4">
          <button
            :class="`button is-primary is-rounded mt-4 `"
            data-testid="getNetId"
            @click="getNetworkId"
          >
            Get ID
          </button>
        </div>
        <label id="getNetId" class="is-child mt-4"></label>
      </div>
    </div>
  </div>
</template>
