import { useLspFactory } from '@/compositions/useLspFactory'

jest.mock('@/helpers/env', () => ({
  PUBLIC_API_SHARED_SECRET: '123',
}))

jest.mock('@/compositions/useWeb3Connection', () => ({
  __esModule: true,
  default: () => ({
    connectWallet: () => jest.fn(),
    disconnect: () => jest.fn(),
    setChainId: () => jest.fn(),
    setupProvider: () => jest.fn(),
    getProvider: () => window.lukso,
  }),
}))

describe('can produce LSP Factory', () => {
  beforeAll(async () => {
    window.lukso = {} as any
    useLspFactory()
  })

  it('should return null for empty chain id', async () => {
    window.lukso = undefined
    expect(useLspFactory).toThrow('Extension not installed')
  })
})
