import useWeb3Connection from '@/compositions/useWeb3Connection'

jest.mock('@/compositions/useWeb3Onboard', () => ({
  __esModule: true,
  default: () => ({}),
}))

const mockIsAddress = jest.fn()

jest.mock('web3-utils', () => {
  const actual = jest.requireActual('web3-utils')
  return { ...actual, isAddress: (val: string) => mockIsAddress(val) }
})

test('can check for validity of address', async () => {
  const { isAddress } = useWeb3Connection()
  isAddress('123')
  expect(mockIsAddress).toBeCalledWith('123')
})
