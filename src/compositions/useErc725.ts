import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js'
import LSP3ProfileMetadata from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json'
import LSP4DigitalAsset from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json'
import LSP9Vault from '@erc725/erc725.js/schemas/LSP9Vault.json'
import { Permissions } from '@erc725/erc725.js/build/main/src/types/Method'
import { FetchDataOutput } from '@erc725/erc725.js/build/main/src/types/decodeData'
import { getSelectedNetworkConfig } from '@/helpers/config'
import useWeb3Connection from './useWeb3Connection'

window.ERC725 = ERC725

const getInstance = (address: string, schema?: ERC725JSONSchema[]) => {
  const { getProvider } = useWeb3Connection()
  const connectedProvider = getProvider()
  const defaultNetworkConfig = getSelectedNetworkConfig()

  // Use connected provider if available, otherwise fall back to HTTP provider
  const provider = connectedProvider || defaultNetworkConfig.http.url

  const config = {
    ipfsGateway: defaultNetworkConfig.ipfs.url,
  }

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
