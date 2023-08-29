import { DEFAULT_GAS_PRICE } from '@/helpers/config'
import PersonalSign from '../PersonalSign.vue'
import { render, fireEvent, screen, waitFor } from '@testing-library/vue'
import { setState } from '@/stores'
import { Contract } from 'web3-eth-contract'
import userEvent from '@testing-library/user-event'

const mockPersonalSign = jest.fn()
const mockRecover = jest.fn()
const mockValidSignatureCall = jest.fn()
const mockHashMessage = jest.fn()

jest.mock('@/compositions/useWeb3', () => ({
  __esModule: true,
  default: () => ({
    personalSign: (message: string, address: string, password?: string) =>
      mockPersonalSign(message, address, password),
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
  mockPersonalSign.mockReturnValue('0x123')
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')
  render(PersonalSign)

  await userEvent.type(screen.getByTestId('password'), 'that-password')

  await fireEvent.click(screen.getByTestId('sign'))

  expect(screen.getByTestId('notification')).toHaveTextContent(
    'Message signed successfully'
  )
  expect(mockPersonalSign).toBeCalledWith(
    'sign message',
    '0x517216362D594516c6f96Ee34b2c502d65B847E4',
    'that-password'
  )
  expect(mockPersonalSign).toReturnWith('0x123')
  expect(screen.getByTestId('signature')).toHaveTextContent('0x123')
})

test('can recovery message', async () => {
  mockPersonalSign.mockReturnValue('0x123')
  mockRecover.mockReturnValue('0x321')
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')
  render(PersonalSign)

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
  mockPersonalSign.mockReturnValue('0x123')
  mockValidSignatureCall.mockReturnValue('0x1626ba7e')
  mockHashMessage.mockReturnValue('0x1626ba7e')
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')
  render(PersonalSign)

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
  mockPersonalSign.mockReturnValue('0x123')
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')
  render(PersonalSign)

  await fireEvent.click(screen.getByTestId('isSiwe'))
  await fireEvent.click(screen.getByTestId('siwe.hasExpirationTime'))
  await fireEvent.click(screen.getByTestId('siwe.hasNotBefore'))
  await fireEvent.update(
    screen.getByTestId('siwe.expirationDate'),
    '2022-09-02'
  )
  await fireEvent.update(screen.getByTestId('siwe.nonce'), 'ABCDEFAB1')
  await fireEvent.update(screen.getByTestId('siwe.domain'), 'example.com')
  await fireEvent.update(
    screen.getByTestId('siwe.address'),
    '0x117216362d594516C6f96ee34B2C502D65b847E4'
  )
  await fireEvent.update(
    screen.getByTestId('siwe.uri'),
    'http://example.com/login'
  )
  await fireEvent.update(screen.getByTestId('siwe.version'), '1')
  await fireEvent.update(screen.getByTestId('siwe.chainId'), '2829')
  await fireEvent.update(screen.getByTestId('siwe.expirationTime'), '11:00')
  await fireEvent.update(screen.getByTestId('siwe.notBeforeDate'), '2022-09-01')
  await fireEvent.update(screen.getByTestId('siwe.notBeforeTime'), '10:00')
  await fireEvent.click(screen.getByTestId('addResource'))
  await userEvent.type(
    screen.getByTestId('siwe.resource-2'),
    'http://some-resource2.com'
  )
  await userEvent.type(screen.getByTestId('password'), 'that-password')

  jest.useFakeTimers().setSystemTime(new Date('2022-09-01 09:00'))

  await fireEvent.click(screen.getByTestId('sign'))

  await waitFor(() => {
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Message signed successfully'
    )
  })
  expect(mockPersonalSign).toBeCalledWith(
    `example.com wants you to sign in with your Ethereum account:
0x117216362d594516C6f96ee34B2C502D65b847E4

By logging in, you confirm the terms and conditions

URI: http://example.com/login
Version: 1
Chain ID: 2829
Nonce: ABCDEFAB1
Issued At: 2022-09-01T09:00:00.000Z
Expiration Time: 2022-09-02T11:00:00.000Z
Not Before: 2022-09-01T10:00:00.000Z
Resources:
- https://mywebsite.com/privacy
- https://mywebsite.com/tos
- http://some-resource2.com`,
    '0x517216362D594516c6f96Ee34b2c502d65B847E4',
    'that-password'
  )
  expect(mockPersonalSign).toReturnWith('0x123')
  expect(screen.getByTestId('signature')).toHaveTextContent('0x123')
})
