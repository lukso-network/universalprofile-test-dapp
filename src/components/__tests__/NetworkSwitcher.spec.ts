import NetworkSwitcher from '../NetworkSwitcher.vue'
import { render, fireEvent, screen } from '@testing-library/vue'
import { setState } from '@/stores'
import { getSelectedNetworkType } from '@/helpers/config'

const mockSwitchNetwork = jest.fn()
const mockSetTargetChainId = jest.fn()

jest.mock('@/compositions/useWeb3Connection', () => ({
  __esModule: true,
  default: () => ({
    switchNetwork: (id: number) => mockSwitchNetwork(id),
  }),
}))

jest.mock('@/compositions/useUpModal', () => ({
  __esModule: true,
  default: () => ({
    setTargetChainId: (id: number) => mockSetTargetChainId(id),
  }),
}))

beforeEach(() => {
  mockSwitchNetwork.mockReset()
  mockSetTargetChainId.mockReset()
  setState('isConnected', false)
  setState('chainId', 0)
  localStorage.clear()
})

test('renders three top-level network options', () => {
  render(NetworkSwitcher)
  expect(screen.getByTestId('network-option-lukso_mainnet')).toBeInTheDocument()
  expect(screen.getByTestId('network-option-lukso_testnet')).toBeInTheDocument()
  expect(screen.getByTestId('network-option-base_mainnet')).toBeInTheDocument()
  // Hidden: base_sepolia stays in NETWORKS but is not exposed in the navbar
  expect(screen.queryByTestId('network-option-base_sepolia')).toBeNull()
})

test('selecting LUKSO Mainnet persists chainId 42 and skips wallet call when disconnected', async () => {
  render(NetworkSwitcher)
  await fireEvent.click(screen.getByTestId('network-option-lukso_mainnet'))

  expect(getSelectedNetworkType()).toBe('lukso_mainnet')
  expect(mockSwitchNetwork).not.toHaveBeenCalled()
  expect(mockSetTargetChainId).toHaveBeenCalledWith(42)
})

test('selecting LUKSO Testnet persists chainId 4201', async () => {
  render(NetworkSwitcher)
  await fireEvent.click(screen.getByTestId('network-option-lukso_testnet'))
  expect(getSelectedNetworkType()).toBe('lukso_testnet')
  expect(mockSetTargetChainId).toHaveBeenCalledWith(4201)
})

test('selecting Base persists chainId 8453', async () => {
  render(NetworkSwitcher)
  await fireEvent.click(screen.getByTestId('network-option-base_mainnet'))
  expect(getSelectedNetworkType()).toBe('base_mainnet')
  expect(mockSetTargetChainId).toHaveBeenCalledWith(8453)
})

test('calls switchNetwork on the wallet when connected', async () => {
  setState('isConnected', true)
  render(NetworkSwitcher)
  await fireEvent.click(screen.getByTestId('network-option-base_mainnet'))
  expect(mockSwitchNetwork).toHaveBeenCalledWith(8453)
  // Connected path delegates UP Modal sync to switchNetwork() in useWeb3Connection
  expect(mockSetTargetChainId).not.toHaveBeenCalled()
})
