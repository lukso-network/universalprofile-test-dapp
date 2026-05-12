import Connect from '../Connect.vue'
import { render, fireEvent, waitFor, screen } from '@testing-library/vue'
import { useState, getState } from '@/stores'
import { UP_MODAL, getSelectedNetworkType } from '@/helpers/config'
import { ref } from 'vue'

const fakeUpModalProvider = {
  on: jest.fn(),
  removeListener: jest.fn(),
  request: jest.fn().mockResolvedValue(undefined),
}

const mockUpModalProvider = ref(fakeUpModalProvider)
const mockInitUpModal = jest.fn()
const mockOpenUpModal = jest.fn()

jest.mock('@/compositions/useUpModal', () => ({
  __esModule: true,
  default: () => ({
    initUpModal: () => mockInitUpModal(),
    openUpModal: () => mockOpenUpModal(),
    provider: mockUpModalProvider,
  }),
}))

jest.mock('@/utils/isDesktop', () => ({
  isDesktop: jest.fn().mockReturnValue(true),
}))

const mockCall = jest.fn()
const mockGetBalance = jest.fn()
const mockDisconnect = jest.fn()
const mockSetupProviderFromEip1193 = jest.fn()
const mockSwitchNetwork = jest.fn()

jest.mock('@/compositions/useWeb3Connection', () => ({
  __esModule: true,
  default: () => ({
    disconnect: () => mockDisconnect(),
    setupProviderFromEip1193: (provider: unknown, channel: string) =>
      mockSetupProviderFromEip1193(provider, channel),
    getChainId: () => 22,
    getBalance: () => mockGetBalance(),
    switchNetwork: (id: number) => mockSwitchNetwork(id),
    contract: () => ({
      methods: {
        owner: () => ({
          call: () => mockCall(),
        }),
      },
    }),
  }),
}))

beforeEach(() => {
  const { setDisconnected } = useState()
  setDisconnected()
  localStorage.clear()
  localStorage.setItem(
    'up:tokens',
    JSON.stringify({ assets: [], lsp7: [], lsp8: [] })
  )
  jest.resetAllMocks()
  mockUpModalProvider.value = fakeUpModalProvider
  fakeUpModalProvider.request.mockResolvedValue(undefined)
})

test('opens UP Modal from the navbar connect button', async () => {
  render(Connect)

  await waitFor(() => {
    expect(mockInitUpModal).toHaveBeenCalled()
  })

  await fireEvent.click(screen.getByTestId('connect-up-modal'))

  expect(mockOpenUpModal).toHaveBeenCalledTimes(1)
})

test('shows connected UP Modal account state', async () => {
  mockGetBalance.mockReturnValue('2')
  const { setConnected } = useState()

  render(Connect)

  await setConnected('0x9967b05ac840324F8BB6F729eD74530866679B11', UP_MODAL)

  await waitFor(() => {
    expect(screen.getByTestId('address')).toHaveTextContent(
      /.*0x9967b0\.\.\..*/,
      {
        normalizeWhitespace: true,
      }
    )
  })
  expect(screen.getByTestId('balance')).toHaveTextContent('2 LYX')
})

test('can disconnect from UP Modal', async () => {
  mockGetBalance.mockReturnValue('2')
  const { setConnected } = useState()
  await setConnected('0x9967b05ac840324F8BB6F729eD74530866679B11', UP_MODAL)

  render(Connect)

  expect(screen.getByTestId('address')).toHaveTextContent('0x9967b0...')

  await fireEvent.click(screen.getByTestId('disconnect'))

  await waitFor(() => {
    expect(mockDisconnect).toHaveBeenCalled()
  })
})

test('chainChanged updates store/localStorage without reloading', async () => {
  const handlers: Record<string, (...args: any[]) => void> = {}
  fakeUpModalProvider.on.mockImplementation(
    (event: string, handler: (...args: any[]) => void) => {
      handlers[event] = handler
      return fakeUpModalProvider
    }
  )

  render(Connect)

  await waitFor(() => {
    expect(handlers.chainChanged).toBeDefined()
  })
  await handlers.chainChanged('0x2a')

  expect(getState('chainId')).toBe(42)
  expect(getSelectedNetworkType()).toBe('lukso_mainnet')
})
