import { ref } from 'vue'
import {
  getSelectedNetworkConfig,
  UP_MODAL,
  WALLET_CONNECT_PROJECT_ID,
} from '@/helpers/config'
import type { Eip1193Provider } from '@/types'

type WagmiConnection = {
  address?: string
  chainId?: number
  connector?: {
    getProvider?: () => Promise<unknown>
  }
  status: 'connecting' | 'reconnecting' | 'connected' | 'disconnected'
}

type LuksoConnector = {
  wagmiConfig: unknown
  showSignInModal: () => void
  closeModal: () => void
  destroyModal: () => void
}

const CONNECTOR_VISIBILITY = {
  upMobile: true,
  upExtension: true,
  eoa: true,
} as const

const isInitializing = ref(false)
const isOpen = ref(false)
const error = ref<Error | null>(null)
const provider = ref<Eip1193Provider | undefined>()
const address = ref('')
const chainId = ref<number | undefined>()
const status = ref<WagmiConnection['status']>('disconnected')
const targetChainId = ref<number>(getSelectedNetworkConfig().chainId)

let connector: LuksoConnector | undefined
let initPromise: Promise<LuksoConnector> | undefined
let unwatchConnection: (() => void) | null | undefined
let syncInProgress = false

const isEip1193Provider = (value: unknown): value is Eip1193Provider => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Eip1193Provider).request === 'function'
  )
}

const toError = (input: unknown): Error => {
  if (input instanceof Error) {
    return input
  }
  const message =
    typeof input === 'object' &&
    input !== null &&
    'message' in input &&
    typeof input.message === 'string'
      ? input.message
      : 'UP Modal connection failed'
  return new Error(message)
}

const getSupportedAdditionalChains = async () => {
  const { luksoTestnet, base, baseSepolia } = await import('viem/chains')
  return [luksoTestnet, base, baseSepolia]
}

const applyWagmiTargetChain = async (nextChainId: number) => {
  if (!connector) return
  // `setupConnectModal` is the public alias for `setupWagmi` in @lukso/up-modal.
  const { setupConnectModal } = await import('@lukso/up-modal')
  setupConnectModal({
    wagmiConfig: connector.wagmiConfig,
    chainId: nextChainId,
    connectors: { ...CONNECTOR_VISIBILITY },
    skipChainSwitch: false,
  })
}

const setTargetChainId = async (nextChainId: number): Promise<void> => {
  if (targetChainId.value === nextChainId && !connector) return
  targetChainId.value = nextChainId
  await applyWagmiTargetChain(nextChainId)
}

const resolveProvider = async (
  connection?: WagmiConnection,
  eventConnector?: { getProvider?: () => Promise<unknown> }
): Promise<Eip1193Provider | undefined> => {
  const candidates = [eventConnector, connection?.connector]
  for (const candidate of candidates) {
    if (!candidate?.getProvider) continue
    try {
      const nextProvider = await candidate.getProvider()
      if (isEip1193Provider(nextProvider)) {
        return nextProvider
      }
    } catch {
      // Some UP Modal connectors expose only wagmi connection state and no
      // EIP-1193 provider. Keep the connection usable in read-only mode.
    }
  }
}

const connectToWeb3Facade = async (
  connection: WagmiConnection,
  nextProvider?: Eip1193Provider
) => {
  if (syncInProgress || !connection.address) return
  syncInProgress = true
  try {
    const { default: useWeb3Connection } = await import('./useWeb3Connection')
    const web3Connection = useWeb3Connection()
    if (nextProvider) {
      await web3Connection.setupProviderFromEip1193(
        nextProvider,
        UP_MODAL,
        false,
        connection.address
      )
    } else {
      await web3Connection.setupProviderlessConnection(
        UP_MODAL,
        connection.address,
        connection.chainId
      )
    }
  } finally {
    syncInProgress = false
  }
}

const handleConnectionChange = async (
  connection: WagmiConnection,
  eventConnector?: { getProvider?: () => Promise<unknown> }
) => {
  status.value = connection.status
  if (connection.status !== 'connected') {
    provider.value = undefined
    address.value = ''
    chainId.value = undefined
    return
  }

  const nextProvider = await resolveProvider(connection, eventConnector)

  provider.value = nextProvider
  address.value = connection.address ?? ''
  chainId.value = connection.chainId
  error.value = null

  await connectToWeb3Facade(connection, nextProvider)
}

const getWagmiConnection = async (): Promise<WagmiConnection | undefined> => {
  if (!connector) return undefined
  const { getConnection } = await import('@wagmi/core')
  return getConnection(connector.wagmiConfig as never) as WagmiConnection
}

const syncConnectedProvider = async (eventConnector?: {
  getProvider?: () => Promise<unknown>
}): Promise<Eip1193Provider | undefined> => {
  const connection = await getWagmiConnection()
  if (!connection) return provider.value
  await handleConnectionChange(connection, eventConnector)
  return provider.value
}

const startConnectionWatcher = async () => {
  if (!connector || unwatchConnection) return
  const { watchConnection } = await import('@wagmi/core')
  unwatchConnection = watchConnection(connector.wagmiConfig as never, {
    onChange: connection => {
      void handleConnectionChange(connection as WagmiConnection)
    },
  })
}

const initUpModal = async (): Promise<LuksoConnector> => {
  if (connector) {
    await syncConnectedProvider()
    return connector
  }
  if (initPromise) return initPromise

  isInitializing.value = true
  initPromise = (async () => {
    try {
      targetChainId.value = getSelectedNetworkConfig().chainId
      const [{ setupLuksoConnector }, additionalChains] = await Promise.all([
        import('@lukso/up-modal'),
        getSupportedAdditionalChains(),
      ])

      const nextConnector = (await setupLuksoConnector({
        walletConnect: {
          enabled: true,
          projectId: WALLET_CONNECT_PROJECT_ID,
          showQrModal: false,
        },
        chains: {
          defaultChainId: targetChainId.value,
          additional: additionalChains,
          skipChainSwitch: false,
        },
        connectors: { ...CONNECTOR_VISIBILITY },
        theme: 'auto',
        onConnect: event => {
          void syncConnectedProvider(event.detail?.connector)
        },
        onError: event => {
          error.value = toError(event.detail?.error ?? event)
        },
        onClose: () => {
          isOpen.value = false
        },
      })) as LuksoConnector

      connector = nextConnector
      await startConnectionWatcher()
      await syncConnectedProvider()
      return nextConnector
    } catch (caught) {
      error.value = toError(caught)
      initPromise = undefined
      throw caught
    } finally {
      isInitializing.value = false
    }
  })()

  return initPromise
}

const openUpModal = async (): Promise<void> => {
  const activeConnector = await initUpModal()
  error.value = null
  isOpen.value = true
  activeConnector.showSignInModal()
}

const closeUpModal = () => {
  connector?.closeModal()
  isOpen.value = false
}

const disconnectUpModal = async () => {
  try {
    if (connector) {
      const { disconnect } = await import('@wagmi/core')
      await disconnect(connector.wagmiConfig as never)
    }
  } finally {
    closeUpModal()
    provider.value = undefined
    address.value = ''
    chainId.value = undefined
    status.value = 'disconnected'
  }
}

const getConnectedProvider = async (): Promise<Eip1193Provider | undefined> => {
  await initUpModal()
  return syncConnectedProvider()
}

const destroyUpModal = () => {
  unwatchConnection?.()
  unwatchConnection = undefined
  connector?.destroyModal()
  connector = undefined
  initPromise = undefined
  provider.value = undefined
  address.value = ''
  chainId.value = undefined
  status.value = 'disconnected'
  isOpen.value = false
  targetChainId.value = getSelectedNetworkConfig().chainId
}

export default function useUpModal() {
  return {
    initUpModal,
    openUpModal,
    closeUpModal,
    disconnectUpModal,
    destroyUpModal,
    getConnectedProvider,
    setTargetChainId,
    provider,
    address,
    chainId,
    status,
    targetChainId,
    isInitializing,
    isOpen,
    error,
  }
}
