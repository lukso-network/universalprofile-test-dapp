import Accounts from '../Accounts.vue'
import { render, fireEvent, screen, waitFor } from '@testing-library/vue'
import { useState } from '@/stores'
import { UP_MODAL } from '@/helpers/config'

const mockOpenUpModal = jest.fn()

jest.mock('@/compositions/useUpModal', () => ({
  __esModule: true,
  default: () => ({
    openUpModal: () => mockOpenUpModal(),
  }),
}))

const mockCall = jest.fn()
const mockDisconnect = jest.fn()
const mockGetBalance = jest.fn()
const mockSwitchNetwork = jest.fn()

jest.mock('@/compositions/useWeb3Connection', () => ({
  __esModule: true,
  default: () => ({
    getChainId: () => 22,
    disconnect: () => mockDisconnect(),
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
})

test('opens UP Modal from the Accounts endpoint', async () => {
  render(Accounts)

  await fireEvent.click(screen.getByTestId('connect-up-modal'))

  expect(mockOpenUpModal).toBeCalledTimes(1)
  expect(await screen.findByTestId('notification')).toHaveTextContent(
    'Open UP Modal to connect your wallet'
  )
})

test('shows UP Modal connected account state', async () => {
  mockGetBalance.mockReturnValue('2')
  const { setConnected } = useState()

  render(Accounts)

  await setConnected('0x9967b05ac840324F8BB6F729eD74530866679B11', UP_MODAL)

  await waitFor(() => {
    expect(screen.getByTestId('info')).toHaveTextContent(
      'Connected to address:'
    )
  })
  expect(screen.getByTestId('chain')).toHaveTextContent('22 (0x16)')
})

test('can disconnect from UP Modal', async () => {
  mockGetBalance.mockReturnValue('2')
  const { setConnected, setDisconnected } = useState()
  await setConnected('0x517216362D594516c6f96Ee34b2c502d65B847E4', UP_MODAL)

  render(Accounts)

  await waitFor(() => {
    expect(screen.getByTestId('connect-up-modal')).toBeDisabled()
    expect(screen.getByTestId('disconnect')).not.toBeDisabled()
  })

  await fireEvent.click(screen.getByTestId('disconnect'))
  setDisconnected()
  await waitFor(() => {
    expect(screen.getByTestId('connect-up-modal')).not.toBeDisabled()
    expect(screen.getByTestId('disconnect')).toBeDisabled()
    expect(screen.getByTestId('notification')).toHaveTextContent('Disconnected')
  })
})
