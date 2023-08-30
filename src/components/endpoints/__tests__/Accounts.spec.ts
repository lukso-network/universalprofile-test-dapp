import Accounts from '../Accounts.vue'
import { render, fireEvent, screen, waitFor } from '@testing-library/vue'
import { useState } from '@/stores'
import { WINDOW_LUKSO } from '@/helpers/config'

const mockCall = jest.fn()
const mockSetupProvider = jest.fn()
const mockOpenWCV2Modal = jest.fn()
const mockResetProvider = jest.fn()
const mockGetProvider = jest.fn()
const mockSendCustomWCV2Request = jest.fn()

window.lukso = {} as any

jest.mock('@/compositions/useWalletConnectV2', () => ({
  __esModule: true,
  default: () => ({
    resetWCV2Provider: () => mockResetProvider(),
    setupWCV2Provider: () => mockSetupProvider(),
    openWCV2Modal: () => mockOpenWCV2Modal(),
    getWCV2Provider: () => mockGetProvider(),
    sendCustomWCV2Request: (request: { method: string; params?: [any] }) =>
      mockSendCustomWCV2Request(request),
  }),
}))

jest.mock('@/compositions/useWeb3Onboard', () => ({
  __esModule: true,
  default: () => ({
    connectWallet: () => jest.fn(),
    disconnect: () => jest.fn(),
    setChainId: () => jest.fn(),
    setupWeb3Onboard: () => jest.fn(),
    getWeb3OnboardProvider: () => window.lukso,
  }),
}))

const mockAccounts = jest.fn()
const mockGetBalance = jest.fn()
const mockRequestAccounts = jest.fn()
const mockSetupWeb3 = jest.fn()

jest.mock('@/compositions/useWeb3', () => ({
  __esModule: true,
  default: () => ({
    setupWeb3: () => mockSetupWeb3(),
    getChainId: () => 22,
    accounts: () => mockAccounts(),
    getBalance: () => mockGetBalance(),
    requestAccounts: () => mockRequestAccounts(),
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
  jest.resetAllMocks()
})

test('can connect to wallet connect V2', async () => {
  mockGetProvider.mockReturnValue({
    wc: {
      connected: false,
    },
  })

  render(Accounts)

  await fireEvent.click(screen.getByTestId('connect-wc-v2'))

  expect(mockSetupProvider).toBeCalledTimes(1)
  expect(mockOpenWCV2Modal).toBeCalledTimes(1)
  expect(await screen.findByTestId('notification')).toHaveTextContent(
    'Connected to address'
  )
})

test('can connect to browser extension when authorized', async () => {
  mockRequestAccounts.mockReturnValue([
    '0x83b21Ba5Cb73f4C17E82f2f7E37787b13d924306',
  ])
  mockGetProvider.mockReturnValue({
    wc: {
      connected: false,
    },
  })

  render(Accounts)

  await fireEvent.click(screen.getByTestId('connect-extension'))

  expect(mockRequestAccounts).toBeCalledTimes(1)
  await waitFor(() => {
    expect(screen.getByTestId('info')).toHaveTextContent('Connected to address')
  })
  // expect(screen.getByTestId('chain')).toHaveTextContent('22 (0x16)')
})

test('can disconnect from browser extension', async () => {
  window.lukso = {} as any
  const { setConnected } = useState()
  setConnected('0x517216362D594516c6f96Ee34b2c502d65B847E4', WINDOW_LUKSO)

  render(Accounts)

  await waitFor(() => {
    expect(screen.getByTestId('connect-extension')).toBeDisabled()
    expect(screen.getByTestId('disconnect')).not.toBeDisabled()
  })

  await fireEvent.click(screen.getByTestId('disconnect'))

  await waitFor(() => {
    expect(screen.getByTestId('connect-extension')).not.toBeDisabled()
    expect(screen.getByTestId('disconnect')).toBeDisabled()
    expect(screen.getByTestId('notification')).toHaveTextContent('Disconnected')
  })
})
