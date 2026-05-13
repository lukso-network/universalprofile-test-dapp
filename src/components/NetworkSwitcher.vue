<script setup lang="ts">
import { computed } from 'vue'
import {
  NETWORKS,
  getSelectedNetworkType,
  setNetworkConfig,
} from '@/helpers/config'
import { getState, setState } from '@/stores'
import useWeb3Connection from '@/compositions/useWeb3Connection'
import useUpModal from '@/compositions/useUpModal'
import type { NetworkType } from '@/interfaces/network'

const { switchNetwork } = useWeb3Connection()
const { setTargetChainId } = useUpModal()

type Option = { key: NetworkType; label: string; chainId: number }

const OPTIONS: Option[] = [
  { key: 'lukso_mainnet', label: 'LUKSO Mainnet', chainId: 42 },
  { key: 'lukso_testnet', label: 'LUKSO Testnet', chainId: 4201 },
  { key: 'base_mainnet', label: 'Base', chainId: 8453 },
]

const selected = computed<NetworkType>(() => {
  const chainId = getState('chainId')
  const match = Object.entries(NETWORKS).find(
    ([, n]) => Number(n.chainId) === chainId
  )
  if (match) return match[0] as NetworkType
  return getSelectedNetworkType()
})

const activeLabel = computed(() => {
  const match = OPTIONS.find(o => o.key === selected.value)
  if (match) return match.label
  return NETWORKS[selected.value]?.name ?? 'Network'
})

const select = async (option: Option) => {
  if (getState('isConnected')) {
    try {
      await switchNetwork(option.chainId)
    } catch (error) {
      console.warn('Network switch rejected/failed', error)
    }
    return
  }
  setNetworkConfig(option.chainId)
  setState('chainId', option.chainId)
  await setTargetChainId(option.chainId)
}
</script>

<template>
  <div class="dropdown is-hoverable" data-testid="network-switcher">
    <div class="dropdown-trigger">
      <button
        class="button is-light is-small"
        aria-haspopup="true"
        aria-controls="network-dropdown-menu"
      >
        <strong>{{ activeLabel }}</strong>
        <span class="icon is-small">
          <i class="fas fa-angle-down" aria-hidden="true"></i>
        </span>
      </button>
    </div>
    <div id="network-dropdown-menu" class="dropdown-menu" role="menu">
      <div class="dropdown-content">
        <a
          v-for="option in OPTIONS"
          :key="option.key"
          class="dropdown-item"
          :class="{ 'is-active has-text-weight-bold': option.key === selected }"
          :data-testid="`network-option-${option.key}`"
          @click="select(option)"
        >
          {{ option.label }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dropdown-item.is-active {
  color: #42b983;
}
</style>
