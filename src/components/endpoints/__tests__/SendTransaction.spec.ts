import SendTransaction from '../SendTransaction.vue'
import { render, fireEvent, screen, waitFor } from '@testing-library/vue'
import { setState } from '@/stores'
import userEvent from '@testing-library/user-event'

const mockGetBalance = jest.fn()
const mockSendTransaction = jest.fn()

jest.mock('@/compositions/useWeb3', () => {
  const actual = jest.requireActual('@/compositions/useWeb3')
  const data = actual.default()
  const web3mock = require('@depay/web3-mock')
  web3mock.mock('ethereum')
  data.setupWeb3(window.ethereum)
  const output = {
    __esModule: true,
    ...actual,
    default: () => {
      return {
        ...data,
        getBalance: () => mockGetBalance(),
        sendTransaction: (params: any) => mockSendTransaction(params),
      }
    },
  }
  return output
})

test('can send lyx transaction', async () => {
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')

  render(SendTransaction)

  await waitFor(() => {
    expect(screen.getByTestId('transaction-from')).not.toBeFalsy()
  })

  await fireEvent.update(screen.getByTestId('transaction-amount'), '2')
  await fireEvent.update(
    screen.getByTestId('transaction-to'),
    '0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298'
  )
  await fireEvent.click(screen.getByTestId('send'))

  expect(screen.getByTestId('notification')).toHaveTextContent(
    'The transaction was successful'
  )
  expect(mockSendTransaction).toBeCalledWith({
    from: '0x517216362D594516c6f96Ee34b2c502d65B847E4',
    to: '0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298',
    value: '2000000000000000000',
    gas: 5000000,
    gasPrice: '10000000000',
  })
})

test('can send lyx transaction with data', async () => {
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')

  render(SendTransaction)

  await waitFor(() => {
    expect(screen.getByTestId('transaction-from')).not.toBeFalsy()
  })

  await fireEvent.update(screen.getByTestId('transaction-amount'), '2')
  await fireEvent.update(
    screen.getByTestId('transaction-to'),
    '0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298'
  )
  await fireEvent.click(screen.getByTestId('hasData'))
  await fireEvent.update(
    screen.getByTestId('data'),
    '0x8fe36f1b00000000000000000000000000000000000000000000000000000000000000c040b8bec57d7b5ff0dbd9e9acd0a47dfeb0101e1a203766f5ccab00445fbf39e900000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000000000000000000000000000000000000000000200000000000000000000000069909c12c875271adc49155cc8d01dbf67fe82f1000000000000000000000000b27f5845e6ce846c02209bd2497780099611b9a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000008bd02b7b000000000000000000000000000000000000000000000000000000000001e19c000000000000000000000000000000000000000000000000000000000000000648656c6c6f210000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014e4c6f72656d20697073756d20646f6c6f722073697420616d65742c20636f6e73656374657475722061646970697363696e6720656c69742c2073656420646f20656975736d6f642074656d706f7220696e6369646964756e74207574206c61626f726520657420646f6c6f7265206d61676e6120616c697175612e20557420656e696d206164206d696e696d2076656e69616d2c2071756973206e6f737472756420657865726369746174696f6e20756c6c616d636f206c61626f726973206e69736920757420616c697175697020657820656120636f6d6d6f646f20636f6e7365717561742e2044756973206175746520697275726520646f6c6f7220696e20726570726568656e646572697420696e20766f6c7570746174652076656c697420657373652063696c6c756d20646f6c6f726520657520667567696174206e756c6c612070617269617475722e000000000000000000000000000000000000'
  )
  await fireEvent.click(screen.getByTestId('send'))

  expect(screen.getByTestId('notification')).toHaveTextContent(
    'The transaction was successful'
  )
  expect(mockSendTransaction).toBeCalledWith({
    data: '0x8fe36f1b00000000000000000000000000000000000000000000000000000000000000c040b8bec57d7b5ff0dbd9e9acd0a47dfeb0101e1a203766f5ccab00445fbf39e900000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000000000000000000000000000000000000000000200000000000000000000000069909c12c875271adc49155cc8d01dbf67fe82f1000000000000000000000000b27f5845e6ce846c02209bd2497780099611b9a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000008bd02b7b000000000000000000000000000000000000000000000000000000000001e19c000000000000000000000000000000000000000000000000000000000000000648656c6c6f210000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014e4c6f72656d20697073756d20646f6c6f722073697420616d65742c20636f6e73656374657475722061646970697363696e6720656c69742c2073656420646f20656975736d6f642074656d706f7220696e6369646964756e74207574206c61626f726520657420646f6c6f7265206d61676e6120616c697175612e20557420656e696d206164206d696e696d2076656e69616d2c2071756973206e6f737472756420657865726369746174696f6e20756c6c616d636f206c61626f726973206e69736920757420616c697175697020657820656120636f6d6d6f646f20636f6e7365717561742e2044756973206175746520697275726520646f6c6f7220696e20726570726568656e646572697420696e20766f6c7570746174652076656c697420657373652063696c6c756d20646f6c6f726520657520667567696174206e756c6c612070617269617475722e000000000000000000000000000000000000',
    from: '0x517216362D594516c6f96Ee34b2c502d65B847E4',
    to: '0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298',
    value: '2000000000000000000',
    gas: 5000000,
    gasPrice: '10000000000',
  })
})

test('can send transaction from preset', async () => {
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')

  render(SendTransaction)

  await waitFor(() => {
    expect(screen.getByTestId('transaction-from')).not.toBeFalsy()
  })

  await userEvent.selectOptions(
    screen.getByTestId('preset'),
    '🏦 Mint 100 ERC20/ERC777/LSP7'
  )
  await userEvent.type(
    screen.getByTestId('transaction-to'),
    '0xB29c50a9F3D90FA3aDF394f2960BD6D8e0Ff5E9D'
  )

  await fireEvent.click(screen.getByTestId('send'))

  expect(screen.getByTestId('notification')).toHaveTextContent(
    'The transaction was successful'
  )
  expect(mockSendTransaction).toBeCalledWith({
    data: '0x40c10f19000000000000000000000000517216362d594516c6f96ee34b2c502d65b847e40000000000000000000000000000000000000000000000056bc75e2d63100000',
    from: '0x517216362D594516c6f96Ee34b2c502d65B847E4',
    to: '0xB29c50a9F3D90FA3aDF394f2960BD6D8e0Ff5E9D',
    value: '100000000000000000',
    gas: 5000000,
    gasPrice: '10000000000',
  })
})
