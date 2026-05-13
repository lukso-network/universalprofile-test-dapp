import useUpModal from '@/compositions/useUpModal'
import { NETWORKS, UP_MODAL, WALLET_CONNECT_PROJECT_ID } from '@/helpers/config'

const mockAddress = '0xcafecafecafecafecafecafecafecafecafecafe'
const mockProvider = {
  request: jest.fn(),
}
const mockWagmiConfig = { id: 'wagmi-config' }
const mockGetProvider = jest.fn().mockResolvedValue(mockProvider)
const mockShowSignInModal = jest.fn()
const mockCloseModal = jest.fn()
const mockDestroyModal = jest.fn()
const mockUnwatchConnection = jest.fn()
const mockSetupProviderFromEip1193 = jest.fn()
const mockSetupProviderlessConnection = jest.fn()
const mockSetupLuksoConnector = jest.fn().mockResolvedValue({
  wagmiConfig: mockWagmiConfig,
  showSignInModal: mockShowSignInModal,
  closeModal: mockCloseModal,
  destroyModal: mockDestroyModal,
})
const mockSetupWagmi = jest.fn()
const mockGetConnection = jest.fn().mockReturnValue({
  status: 'connected',
  address: mockAddress,
  chainId: NETWORKS.lukso_mainnet.chainId,
  connector: {
    getProvider: mockGetProvider,
  },
})
const mockWatchConnection = jest.fn().mockReturnValue(mockUnwatchConnection)
const mockDisconnect = jest.fn()

jest.mock('@lukso/up-modal', () => ({
  setupLuksoConnector: mockSetupLuksoConnector,
  setupConnectModal: mockSetupWagmi,
}))

jest.mock('viem/chains', () => ({
  luksoTestnet: { id: 4201, name: 'LUKSO Testnet' },
  base: { id: 8453, name: 'Base' },
  baseSepolia: { id: 84532, name: 'Base Sepolia' },
}))

jest.mock('@wagmi/core', () => ({
  getConnection: mockGetConnection,
  watchConnection: mockWatchConnection,
  disconnect: mockDisconnect,
}))

jest.mock('@/compositions/useWeb3Connection', () => ({
  __esModule: true,
  default: () => ({
    setupProviderFromEip1193: mockSetupProviderFromEip1193,
    setupProviderlessConnection: mockSetupProviderlessConnection,
  }),
}))

describe('useUpModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    mockSetupLuksoConnector.mockResolvedValue({
      wagmiConfig: mockWagmiConfig,
      showSignInModal: mockShowSignInModal,
      closeModal: mockCloseModal,
      destroyModal: mockDestroyModal,
    })
    mockGetProvider.mockResolvedValue(mockProvider)
    mockGetConnection.mockReturnValue({
      status: 'connected',
      address: mockAddress,
      chainId: NETWORKS.lukso_mainnet.chainId,
      connector: {
        getProvider: mockGetProvider,
      },
    })
  })

  afterEach(() => {
    useUpModal().destroyUpModal()
  })

  it('initializes UP Modal with WalletConnect and all supported chains', async () => {
    const upModal = useUpModal()

    await upModal.initUpModal()

    expect(mockSetupLuksoConnector).toHaveBeenCalledWith(
      expect.objectContaining({
        walletConnect: expect.objectContaining({
          enabled: true,
          projectId: WALLET_CONNECT_PROJECT_ID,
          showQrModal: false,
        }),
        chains: expect.objectContaining({
          defaultChainId: NETWORKS.lukso_testnet.chainId,
          additional: [
            expect.objectContaining({ id: 4201 }),
            expect.objectContaining({ id: 8453 }),
            expect.objectContaining({ id: 84532 }),
          ],
          skipChainSwitch: false,
        }),
        connectors: {
          upMobile: true,
          upExtension: true,
          eoa: true,
        },
        theme: 'auto',
      })
    )
    expect(mockWatchConnection).toHaveBeenCalledWith(
      mockWagmiConfig,
      expect.objectContaining({ onChange: expect.any(Function) })
    )
  })

  it('uses the currently selected network as the default chain at init', async () => {
    localStorage.setItem('selected-network', 'base_mainnet')
    const upModal = useUpModal()

    await upModal.initUpModal()

    expect(mockSetupLuksoConnector).toHaveBeenCalledWith(
      expect.objectContaining({
        chains: expect.objectContaining({
          defaultChainId: NETWORKS.base_mainnet.chainId,
        }),
      })
    )
    expect(upModal.targetChainId.value).toBe(NETWORKS.base_mainnet.chainId)
  })

  it('updates wagmi target chain via setupWagmi after init', async () => {
    const upModal = useUpModal()
    await upModal.initUpModal()
    mockSetupWagmi.mockClear()

    await upModal.setTargetChainId(NETWORKS.base_mainnet.chainId)

    expect(upModal.targetChainId.value).toBe(NETWORKS.base_mainnet.chainId)
    expect(mockSetupWagmi).toHaveBeenCalledWith(
      expect.objectContaining({
        wagmiConfig: mockWagmiConfig,
        chainId: NETWORKS.base_mainnet.chainId,
        connectors: { upMobile: true, upExtension: true, eoa: true },
        skipChainSwitch: false,
      })
    )
  })

  it('skips wagmi update when no connector exists yet', async () => {
    const upModal = useUpModal()

    await upModal.setTargetChainId(NETWORKS.lukso_testnet.chainId)

    expect(mockSetupWagmi).not.toHaveBeenCalled()
    expect(upModal.targetChainId.value).toBe(NETWORKS.lukso_testnet.chainId)
  })

  it('bridges the connected EIP-1193 provider into the Web3 facade', async () => {
    const upModal = useUpModal()

    await upModal.initUpModal()

    expect(upModal.provider.value?.request).toBe(mockProvider.request)
    expect(upModal.address.value).toBe(mockAddress)
    expect(upModal.chainId.value).toBe(NETWORKS.lukso_mainnet.chainId)
    expect(mockSetupProviderFromEip1193).toHaveBeenCalledWith(
      mockProvider,
      UP_MODAL,
      false,
      mockAddress
    )
    expect(mockSetupProviderlessConnection).not.toHaveBeenCalled()
  })

  it('keeps UP Modal connections usable when no EIP-1193 provider is exposed', async () => {
    mockGetProvider.mockResolvedValue(undefined)
    const upModal = useUpModal()

    await upModal.initUpModal()

    expect(upModal.provider.value).toBeUndefined()
    expect(upModal.address.value).toBe(mockAddress)
    expect(upModal.chainId.value).toBe(NETWORKS.lukso_mainnet.chainId)
    expect(upModal.error.value).toBeNull()
    expect(mockSetupProviderFromEip1193).not.toHaveBeenCalled()
    expect(mockSetupProviderlessConnection).toHaveBeenCalledWith(
      UP_MODAL,
      mockAddress,
      NETWORKS.lukso_mainnet.chainId
    )
  })

  it('opens the UP Modal sign-in dialog', async () => {
    const upModal = useUpModal()

    await upModal.openUpModal()

    expect(mockShowSignInModal).toHaveBeenCalled()
    expect(upModal.isOpen.value).toBe(true)
  })

  it('disconnects through wagmi and clears local UP Modal state', async () => {
    const upModal = useUpModal()
    await upModal.initUpModal()

    await upModal.disconnectUpModal()

    expect(mockDisconnect).toHaveBeenCalledWith(mockWagmiConfig)
    expect(mockCloseModal).toHaveBeenCalled()
    expect(upModal.provider.value).toBeUndefined()
    expect(upModal.address.value).toBe('')
    expect(upModal.chainId.value).toBeUndefined()
    expect(upModal.status.value).toBe('disconnected')
  })
})
