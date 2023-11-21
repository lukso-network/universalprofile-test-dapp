import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js'
import LSP3ProfileMetadata from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json'
import LSP4DigitalAsset from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json'
import LSP9Vault from '@erc725/erc725.js/schemas/LSP9Vault.json'
import { Permissions } from '@erc725/erc725.js/build/main/src/types/Method'
import { FetchDataOutput } from '@erc725/erc725.js/build/main/src/types/decodeData'
import Web3 from 'web3'
import { getSelectedNetworkConfig } from '@/helpers/config'

window.ERC725 = ERC725

const defaultNetworkConfig = getSelectedNetworkConfig()
const provider = new Web3.providers.HttpProvider(defaultNetworkConfig.rpc.url)
const config = {
  ipfsGateway: defaultNetworkConfig.ipfs.url,
}

const getInstance = (address: string, schema?: ERC725JSONSchema[]) => {
  const erc725 = new ERC725(
    schema
      ? schema
      : (LSP3ProfileMetadata.concat(
          LSP4DigitalAsset,
          LSP9Vault
        ) as ERC725JSONSchema[]),
    address,
    provider,
    config
  )

  return erc725
}

const fetchProfile = async (
  address: string
): Promise<FetchDataOutput['value']> => {
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

export default function useErc725() {
  return {
    fetchProfile,
    getInstance,
    encodePermissions,
    decodePermissions,
  }
}
