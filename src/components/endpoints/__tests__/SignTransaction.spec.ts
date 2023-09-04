import SignTransaction from '../SignTransaction.vue'
import { render, fireEvent, screen, waitFor } from '@testing-library/vue'
import { setState } from '@/stores'

const mockGetDataCall = jest.fn()
const mockSignTransaction = jest.fn()
const mockValidSignatureCall = jest.fn()
const mockRecoverRawTransaction = jest.fn()
const mockSerializeTransaction = jest.fn()
const mockKeccak256 = jest.fn()
const mockRlpDecode = jest.fn()
const mockJoinSignature = jest.fn()

jest.mock('ethers/lib/utils', () => ({
  serializeTransaction: (value: any) => mockSerializeTransaction(value),
  keccak256: (value: any) => mockKeccak256(value),
  joinSignature: (value: any) => mockJoinSignature(value),
  RLP: {
    decode: (value: any) => mockRlpDecode(value),
  },
}))

jest.mock('@/compositions/useWeb3Connection', () => {
  const actual = jest.requireActual('@/compositions/useWeb3Connection')
  return {
    __esModule: true,
    ...actual,
    default: () => ({
      signTransaction: (params: any, address: string) => {
        return mockSignTransaction(params, address)
      },
      recoverRawTransaction: (params: any) => mockRecoverRawTransaction(params),
      contract: () => ({
        methods: {
          isValidSignature: (hash: any, signature: any) => ({
            call: () => mockValidSignatureCall(hash, signature),
          }),
          getData: (value: any) => ({
            call: () => mockGetDataCall(value),
          }),
        },
      }),
      getWeb3: () => ({
        eth: {
          signTransaction: (params: any, address: string) => {
            return mockSignTransaction(params, address)
          },
        },
      }),
    }),
  }
})

beforeEach(() => {
  jest.resetAllMocks()
})

test('can sign transaction', async () => {
  mockSignTransaction.mockReturnValue('0x123')
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')
  render(SignTransaction)

  await waitFor(() => {
    expect(screen.getByTestId('transaction-from')).not.toBeFalsy()
  })

  await fireEvent.update(screen.getByTestId('transaction-amount'), '2')
  await fireEvent.update(
    screen.getByTestId('transaction-to'),
    '0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298'
  )
  await fireEvent.click(screen.getByTestId('sign'))

  expect(screen.getByTestId('notification')).toHaveTextContent(
    'The transaction was signed'
  )
  expect(mockSignTransaction).toBeCalledWith(
    {
      from: '0x517216362D594516c6f96Ee34b2c502d65B847E4',
      gas: 5000000,
      gasPrice: '10000000000',
      to: '0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298',
      value: '2000000000000000000',
    },
    '0x517216362D594516c6f96Ee34b2c502d65B847E4'
  )
  expect(mockSignTransaction).toReturnWith('0x123')
  expect(screen.getByTestId('signature')).toHaveTextContent('0x123')
})

test('can recover EoA', async () => {
  mockSignTransaction.mockReturnValue('0x123')
  mockRecoverRawTransaction.mockReturnValue('0x321')
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')
  render(SignTransaction)

  await fireEvent.click(screen.getByTestId('sign'))
  await fireEvent.click(screen.getByTestId('recover'))

  expect(screen.getByTestId('notification')).toHaveTextContent(
    'Recover was successful'
  )
  expect(mockRecoverRawTransaction).toBeCalledWith(expect.anything())
  expect(mockRecoverRawTransaction).toReturnWith('0x321')
  expect(screen.getByTestId('recovery-eoa')).toHaveTextContent('0x321')
})

test('fail to recover EoA without signing', async () => {
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')
  render(SignTransaction)

  await fireEvent.click(screen.getByTestId('recover'))

  expect(screen.getByTestId('notification')).toHaveTextContent(
    'Please sign transaction first'
  )
})

test('can validate EoA permissions', async () => {
  mockSignTransaction.mockReturnValue('0x123')
  mockRecoverRawTransaction.mockReturnValue('0xabcdef55')
  mockGetDataCall.mockReturnValue('0xFFFFFF')
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')
  render(SignTransaction)

  await fireEvent.click(screen.getByTestId('sign'))
  await fireEvent.click(screen.getByTestId('recover'))
  await fireEvent.click(screen.getByTestId('validate-permission'))

  expect(screen.getByTestId('notification')).toHaveTextContent(
    'Recover was successful'
  )
  expect(screen.getByTestId('permissions')).toHaveTextContent('true')
  expect(mockGetDataCall).toBeCalledTimes(1)
  expect(mockGetDataCall).toReturnWith('0xFFFFFF')
  expect(screen.getByTestId('recovery-eoa')).toHaveTextContent('0xabcdef55')
})

test('fail to validate EoA permissions', async () => {
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')
  render(SignTransaction)

  await fireEvent.click(screen.getByTestId('validate-permission'))

  expect(screen.getByTestId('notification')).toHaveTextContent(
    'Please, recover address first'
  )
})

test('can verify signature', async () => {
  mockSignTransaction.mockReturnValue('0x123')
  mockValidSignatureCall.mockReturnValue('0x1626ba7e')
  mockJoinSignature.mockReturnValue('dummy-signature')
  mockRlpDecode.mockReturnValue(['0x00', 2, 3])
  mockKeccak256.mockReturnValue('transaction-hashed-for-signing')
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')
  render(SignTransaction)

  await fireEvent.click(screen.getByTestId('sign'))
  await fireEvent.click(screen.getByTestId('validate-signature'))

  expect(screen.getByTestId('notification')).toHaveTextContent(
    'Signature validated successfully'
  )
  expect(mockValidSignatureCall).toBeCalledTimes(1)
  expect(mockValidSignatureCall).toBeCalledWith(
    'transaction-hashed-for-signing',
    'dummy-signature'
  )
  expect(mockValidSignatureCall).toReturnWith('0x1626ba7e')
  expect(screen.getByTestId('magic-value')).toHaveTextContent('0x1626ba7e')
})

test('fail to validate signature without signing', async () => {
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')
  render(SignTransaction)

  await fireEvent.click(screen.getByTestId('validate-signature'))

  expect(screen.getByTestId('notification')).toHaveTextContent(
    'Please sign transaction first'
  )
})
