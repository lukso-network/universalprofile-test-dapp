import { createIpfsLink, createBlockScoutLink } from '@/utils/createLinks'

test('createBlockScoutLink(): returns correct blockscout link', () => {
  const link = createBlockScoutLink('ABC', true)
  expect(link).toBe('https://explorer.testnet.lukso.network/tx/ABC')

  const linkAddress = createBlockScoutLink('ABC')
  expect(linkAddress).toBe(`https://explorer.testnet.lukso.network/address/ABC`)
})

test('createIpfsLink(): returns correct ipfs link', () => {
  const link = createIpfsLink('ipfs://ABC')
  expect(link).toBe(`https://2eff.lukso.dev/ipfs/ABC`)
})
