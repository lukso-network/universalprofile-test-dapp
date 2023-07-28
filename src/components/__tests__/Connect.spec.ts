import Connect from '../Connect.vue'
import { render, fireEvent, waitFor, screen } from '@testing-library/vue'
import { useState } from '@/stores'
import { WALLET_CONNECT } from '@/helpers/config'

const mockCall = jest.fn()
const mockSetupProvider = jest.fn()
const mockOpenWCV2Modal = jest.fn()
const mockResetProvider = jest.fn()
const mockGetProvider = jest.fn()
const mockSendCustomWCV2Request = jest.fn()

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

jest.mock('@/utils/isDesktop', () => ({
  isDesktop: jest.fn().mockReturnValue(true),
}))

const mockSetupWeb3 = jest.fn()
const mockAccounts = jest.fn()
const mockGetBalance = jest.fn()
const mockRequestAccounts = jest.fn()

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
  const { setDisconnected } = useState()
  setDisconnected()
  jest.resetAllMocks()
})

test('can connect to wallet connect V2', async () => {
  mockGetProvider.mockReturnValue({
    wc: {
      connected: false,
    },
  })

  render(Connect)

  expect(mockSetupProvider).toBeCalledTimes(1)

  await fireEvent.click(screen.getByTestId('connect-wc-v2'))

  expect(mockSetupProvider).toBeCalledTimes(2)
  expect(mockOpenWCV2Modal).toBeCalledTimes(1)
})

test('can disconnect from wallet connect V2', async () => {
  mockGetProvider.mockReturnValue({
    wc: {
      connected: true,
    },
  })
  mockGetBalance.mockReturnValue('2')
  const { setConnected } = useState()
  setConnected('0x8e54b33F8d42E59c0B4Cf02e6457CF8bb6a71094', WALLET_CONNECT)

  render(Connect)

  expect(mockSetupProvider).toBeCalledTimes(1)
  expect(screen.getByTestId('address')).toHaveTextContent('0x8e54b3...')

  await fireEvent.click(screen.getByTestId('disconnect'))

  expect(screen.queryByTestId('address')).toBeFalsy()
})

test('can connect to browser extension when authorized', async () => {
  mockAccounts.mockResolvedValue('0xD8B0b80Fa7938f2F841b314d8b6052EAe97db826')
  mockGetProvider.mockReturnValue({
    wc: {
      connected: false,
    },
  })
  mockGetBalance.mockReturnValue('2')

  render(Connect)

  await fireEvent.click(screen.getByTestId('connect-extension'))

  // expect(mockSetupWeb3).toBeCalledTimes(1)
  // expect(mockAccounts).toBeCalledTimes(2)
  await waitFor(() => {
    expect(screen.getByTestId('address')).toHaveTextContent(
      /.*0xD8B0b8\.\.\..*/,
      {
        normalizeWhitespace: true,
      }
    )
  })
  await waitFor(() => {
    expect(screen.getByTestId('balance')).toHaveTextContent('2 LYX')
  })
})

test('can connect to browser extension when not authorized', async () => {
  window.ethereum = {} as typeof window.ethereum
  mockAccounts.mockResolvedValue(undefined)
  mockRequestAccounts.mockReturnValue([
    '0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298',
  ])
  mockGetProvider.mockReturnValue({
    wc: {
      connected: false,
    },
  })
  mockGetBalance.mockReturnValue('3')

  render(Connect)

  await waitFor(
    () => {
      expect(screen.getByTestId('connect-extension')).toBeEnabled()
    },
    { timeout: 1000 }
  )

  await fireEvent.click(screen.getByTestId('connect-extension'))
  await waitFor(() => {
    expect(screen.getByTestId('address')).toHaveTextContent(
      /.*0x7367C9\.\.\..*/,
      { normalizeWhitespace: true }
    )
    expect(mockRequestAccounts).toBeCalled()
    expect(screen.getByTestId('balance')).toHaveTextContent('3 LYX')
  })
}, 5000)
