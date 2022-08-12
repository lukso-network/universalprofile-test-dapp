import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js'
import LSP3UniversalProfileMetadata from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json'
import { Permissions } from '@erc725/erc725.js/build/main/src/types/Method'
import { DecodeDataOutput } from '@erc725/erc725.js/build/main/src/types/decodeData'
import Web3 from 'web3'
import { DEFAULT_NETWORK_CONFIG } from '@/helpers/config'

window.ERC725 = ERC725

const provider = new Web3.providers.HttpProvider(DEFAULT_NETWORK_CONFIG.rpc.url)
const config = {
  ipfsGateway: DEFAULT_NETWORK_CONFIG.ipfs.url,
}

const getInstance = (address: string) => {
  const erc725 = new ERC725(
    LSP3UniversalProfileMetadata as ERC725JSONSchema[],
    address,
    provider,
    config
  )

  return erc725
}

const fetchProfile = async (
  address: string
): Promise<DecodeDataOutput['value']> => {
  const erc725 = getInstance(address)
  const profile = await erc725.fetchData('LSP3Profile')
  return profile.value
}

const encodePermissions = (permissions: Permissions) => {
  return ERC725.encodePermissions(permissions)
}

const decodePermissions = (permissionHex: string) => {
  return ERC725.decodePermissions(permissionHex)
}

export default function useErc725(): {
  fetchProfile: (address: string) => Promise<DecodeDataOutput['value']>
  getInstance: (address: string) => ERC725
  encodePermissions: (permissions: Permissions) => string
  decodePermissions: (permissionHex: string) => Permissions
} {
  return {
    fetchProfile,
    getInstance,
    encodePermissions,
    decodePermissions,
  }
}
