import { DEFAULT_GAS_PRICE } from '@/helpers/config'
import Sign from '../Sign.vue'
import { render, fireEvent, screen } from '@testing-library/vue'
import { setState } from '@/stores'
import { Contract } from 'web3-eth-contract'
import userEvent from '@testing-library/user-event'

const mockSign = jest.fn()
const mockRecover = jest.fn()
const mockValidSignatureCall = jest.fn()
const mockHashMessage = jest.fn()

jest.mock('@/compositions/useWeb3', () => ({
  __esModule: true,
  default: () => ({
    sign: (message: string, address: string) => mockSign(message, address),
    recover: (message: string, signature: string) =>
      mockRecover(message, signature),
    getWeb3: () => ({
      eth: {
        accounts: {
          hashMessage: () => mockHashMessage(),
        },
      },
    }),
  }),
}))

window.erc725Account = {
  methods: {
    isValidSignature: () => ({
      call: () => mockValidSignatureCall(),
    }),
  },
  options: {
    gasPrice: DEFAULT_GAS_PRICE,
  },
} as Contract

beforeEach(() => {
  jest.resetAllMocks()
})

test('can sign message', async () => {
  mockSign.mockReturnValue('0x123')
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')
  render(Sign)

  await fireEvent.click(screen.getByTestId('sign'))

  expect(screen.getByTestId('notification')).toHaveTextContent(
    'Message signed successfully'
  )
  expect(mockSign).toBeCalledWith(
    'sign message',
    '0x517216362D594516c6f96Ee34b2c502d65B847E4'
  )
  expect(mockSign).toReturnWith('0x123')
  expect(screen.getByTestId('signature')).toHaveTextContent('0x123')
})

test('can recovery message', async () => {
  mockSign.mockReturnValue('0x123')
  mockRecover.mockReturnValue('0x321')
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')
  render(Sign)

  await fireEvent.click(screen.getByTestId('sign'))
  await fireEvent.click(screen.getByTestId('recover'))

  expect(screen.getByTestId('notification')).toHaveTextContent(
    'Recover was successful'
  )
  expect(mockRecover).toBeCalledWith('sign message', '0x123')
  expect(mockRecover).toReturnWith('0x321')
  expect(screen.getByTestId('recovery-eoa')).toHaveTextContent('0x321')
})

test('can verify signature', async () => {
  mockSign.mockReturnValue('0x123')
  mockValidSignatureCall.mockReturnValue('0x1626ba7e')
  mockHashMessage.mockReturnValue('0x1626ba7e')
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')
  render(Sign)

  await fireEvent.click(screen.getByTestId('sign'))
  await fireEvent.click(screen.getByTestId('validate-signature'))

  expect(screen.getByTestId('notification')).toHaveTextContent(
    'Signature validated successfully'
  )
  expect(mockValidSignatureCall).toBeCalledTimes(1)
  expect(mockValidSignatureCall).toReturnWith('0x1626ba7e')
  expect(screen.getByTestId('magic-value')).toHaveTextContent('0x1626ba7e')
})

test('can sign with ethereum', async () => {
  mockSign.mockReturnValue('0x123')
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')
  render(Sign)

  await fireEvent.click(screen.getByTestId('isSiwe'))
  await fireEvent.click(screen.getByTestId('siwe.hasExpirationTime'))
  await fireEvent.click(screen.getByTestId('siwe.hasNotBefore'))
  await fireEvent.update(
    screen.getByTestId('siwe.expirationDate'),
    '2022-09-02'
  )
  await fireEvent.update(screen.getByTestId('siwe.nonce'), '1')
  await fireEvent.update(screen.getByTestId('siwe.domain'), 'example.com')
  await fireEvent.update(
    screen.getByTestId('siwe.address'),
    '0x117216362D594516c6f96Ee34b2c502d65B847E4'
  )
  await fireEvent.update(
    screen.getByTestId('siwe.uri'),
    'http://example.com/login'
  )
  await fireEvent.update(screen.getByTestId('siwe.version'), '2')
  await fireEvent.update(screen.getByTestId('siwe.chainId'), '2829')
  await fireEvent.update(screen.getByTestId('siwe.expirationTime'), '11:00')
  await fireEvent.update(screen.getByTestId('siwe.notBeforeDate'), '2022-09-01')
  await fireEvent.update(screen.getByTestId('siwe.notBeforeTime'), '10:00')
  await fireEvent.click(screen.getByTestId('addResource'))
  await userEvent.type(
    screen.getByTestId('siwe.resource-1'),
    'http://some-resource2.com'
  )

  jest.useFakeTimers().setSystemTime(new Date('2022-09-01 09:00'))

  await fireEvent.click(screen.getByTestId('sign'))

  expect(screen.getByTestId('notification')).toHaveTextContent(
    'Message signed successfully'
  )
  expect(mockSign).toBeCalledWith(
    `example.com wants you to sign in with your Ethereum account:
0x117216362D594516c6f96Ee34b2c502d65B847E4

sign message

URI: http://example.com/login
Version: 2
Chain ID: 2829
Nonce: 1
Issued At: 2022-09-01T09:00:00.000Z
Expiration Time: 2022-09-02T11:00:00.000Z
Not Before: 2022-09-01T10:00:00.000Z
Resources:
- http://some-resource1.com
- http://some-resource2.com`,
    '0x517216362D594516c6f96Ee34b2c502d65B847E4'
  )
  expect(mockSign).toReturnWith('0x123')
  expect(screen.getByTestId('signature')).toHaveTextContent('0x123')
})
