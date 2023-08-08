import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js'
import LSP3UniversalProfileMetadata from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json'
import lsp3Schema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json'
import lsp4Schema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json'
import lsp9Schema from '@erc725/erc725.js/schemas/LSP9Vault.json'
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

const getInstance = (address: string) => {
  const erc725 = new ERC725(
    LSP3UniversalProfileMetadata.concat(
      lsp3Schema,
      lsp4Schema,
      lsp9Schema
    ) as ERC725JSONSchema[],
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

export default function useErc725(): {
  fetchProfile: (address: string) => Promise<FetchDataOutput['value']>
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
