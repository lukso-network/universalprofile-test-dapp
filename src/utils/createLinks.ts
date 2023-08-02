import { getSelectedNetworkConfig } from '@/helpers/config'

export function createIpfsLink(url: string): string {
  return url.replace('ipfs://', getSelectedNetworkConfig().ipfs.url)
}

export function createBlockScoutLink(hash: string, isTx = false): string {
  return `${getSelectedNetworkConfig().blockscout.url}/${
    isTx ? 'tx' : 'address'
  }/${hash}`
}
