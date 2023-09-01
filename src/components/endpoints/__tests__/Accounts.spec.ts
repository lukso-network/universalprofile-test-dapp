import Accounts from '../Accounts.vue'
import { render, fireEvent, screen, waitFor } from '@testing-library/vue'
import { useState } from '@/stores'
import { WINDOW_LUKSO } from '@/helpers/config'

const mockCall = jest.fn()
const mockSetupProvider = jest.fn()
const mockGetProvider = jest.fn()

window.lukso = {} as any

const mockAccounts = jest.fn()
const mockGetBalance = jest.fn()
const mockRequestAccounts = jest.fn()

jest.mock('@/compositions/useWeb3Connection', () => ({
  __esModule: true,
  default: () => ({
    setupProvider: () => mockSetupProvider(),
    getChainId: () => 22,
    accounts: () => mockAccounts(),
    disconnect: jest.fn(),
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
  const { setConnected } = useState()

  render(Accounts)

  await fireEvent.click(screen.getByTestId('connect-extension'))
  await setConnected('0x8e54b33F8d42E59c0B4Cf02e6457CF8bb6a71094', WINDOW_LUKSO)

  await waitFor(() => {
    expect(screen.getByTestId('info')).toHaveTextContent(
      'Connected to address:'
    )
  })
  expect(screen.getByTestId('chain')).toHaveTextContent('22 (0x16)')
})

test('can disconnect from browser extension', async () => {
  window.lukso = {} as any
  const { setConnected, setDisconnected } = useState()
  setConnected('0x517216362D594516c6f96Ee34b2c502d65B847E4', WINDOW_LUKSO)

  render(Accounts)

  await waitFor(() => {
    expect(screen.getByTestId('connect-extension')).toBeDisabled()
    expect(screen.getByTestId('disconnect')).not.toBeDisabled()
  })

  await fireEvent.click(screen.getByTestId('disconnect'))
  setDisconnected()
  await waitFor(() => {
    expect(screen.getByTestId('connect-extension')).not.toBeDisabled()
    expect(screen.getByTestId('disconnect')).toBeDisabled()
    expect(screen.getByTestId('notification')).toHaveTextContent('Disconnected')
  })
})
