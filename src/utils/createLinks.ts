import { DEFAULT_NETWORK_CONFIG } from '@/helpers/config'

export function createIpfsLink(url: string): string {
  return url.replace('ipfs://', DEFAULT_NETWORK_CONFIG.ipfs.url)
}

export function createBlockScoutLink(hash: string, isTx = false): string {
  return `${DEFAULT_NETWORK_CONFIG.blockscout.url}/${
    isTx ? 'tx' : 'address'
  }/${hash}`
}
