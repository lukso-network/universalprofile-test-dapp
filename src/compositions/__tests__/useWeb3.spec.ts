import useWeb3 from '@/compositions/useWeb3'

const mockIsAddress = jest.fn()

jest.mock('web3-utils', () => {
  const actual = jest.requireActual('web3-utils')
  return { ...actual, isAddress: (val: string) => mockIsAddress(val) }
})

test('can check for validity of address', async () => {
  const { isAddress } = useWeb3()
  isAddress('123')
  expect(mockIsAddress).toBeCalledWith('123')
})
