<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const showInstallPrompt = ref(false)
const showUpdatePrompt = ref(false)
let deferredPrompt: any = null

const { updateServiceWorker } = useRegisterSW({
  onNeedRefresh() {
    showUpdatePrompt.value = true
  },
  onOfflineReady() {
    console.log('PWA is ready for offline use')
  },
})

const handleBeforeInstallPrompt = (e: Event) => {
  e.preventDefault()
  deferredPrompt = e

  // Check if already installed
  if (!window.matchMedia('(display-mode: standalone)').matches) {
    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    const dismissedTime = dismissed ? parseInt(dismissed) : 0
    const daysSinceDismissed =
      (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)

    // Show prompt if never dismissed or if it's been more than 7 days
    if (!dismissed || daysSinceDismissed > 7) {
      showInstallPrompt.value = true
    }
  }
}

const installPWA = async () => {
  if (!deferredPrompt) return

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice

  if (outcome === 'accepted') {
    console.log('PWA installed')
  }

  deferredPrompt = null
  showInstallPrompt.value = false
}

const dismissPrompt = () => {
  showInstallPrompt.value = false
  localStorage.setItem('pwa-install-dismissed', Date.now().toString())
}

const updatePWA = () => {
  updateServiceWorker(true)
}

const dismissUpdate = () => {
  showUpdatePrompt.value = false
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

  // Check if running as installed PWA
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('Running as installed PWA')
  }
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
})
</script>

<template>
  <div v-if="showInstallPrompt" class="pwa-install-prompt">
    <div class="notification is-info">
      <button class="delete" @click="dismissPrompt"></button>
      <div class="columns is-vcentered">
        <div class="column">
          <p class="has-text-weight-semibold">Install UP Test dApp</p>
          <p class="is-size-7">
            Add this app to your home screen for quick access and offline use
          </p>
        </div>
        <div class="column is-narrow">
          <button class="button is-primary" @click="installPWA">
            Install App
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showUpdatePrompt" class="pwa-update-prompt">
    <div class="notification is-warning">
      <button class="delete" @click="dismissUpdate"></button>
      <div class="columns is-vcentered">
        <div class="column">
          <p class="has-text-weight-semibold">Update Available</p>
          <p class="is-size-7">
            A new version of the app is available. Reload to update.
          </p>
        </div>
        <div class="column is-narrow">
          <button class="button is-primary" @click="updatePWA">Reload</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pwa-install-prompt,
.pwa-update-prompt {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  max-width: 500px;
  width: calc(100% - 40px);
}

@media (width <= 768px) {
  .pwa-install-prompt,
  .pwa-update-prompt {
    bottom: 10px;
    width: calc(100% - 20px);
  }
}
</style>
