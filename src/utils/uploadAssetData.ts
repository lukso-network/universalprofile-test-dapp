import { LSP4MetadataContentBeforeUpload } from '@lukso/lsp-factory.js/build/main/src/lib/interfaces/lsp4-digital-asset'
import { getSelectedNetworkConfig } from '@/helpers/config'
import { LSP4DigitalAssetMetadata } from '@lukso/lsp-factory.js'
import { AuthenticatedFormDataUploader } from '@/services/ipfs/authenticated-formdata-client'
import { BaseFormDataUploader } from '@/services/ipfs/formdata-base-client'

let uploadProvider: BaseFormDataUploader | undefined

function getUploadProvider() {
  if (!uploadProvider) {
    uploadProvider = new AuthenticatedFormDataUploader(
      getSelectedNetworkConfig().ipfs.url,
      {}
    )
  }
  return uploadProvider
}

export const uploadAssetData = async (
  metadata: LSP4MetadataContentBeforeUpload
) => {
  const uploadProvider = getUploadProvider()
  const uploadOptions = {
    ipfsGateway: {
      // the http client adds /add and lsp-factory.js is currently still using it.
      // TODO: Change once lsp-factory.js is updated.
      url: uploadProvider.getEndpoint().replace('/add', ''),
      headers: {
        Authorization: `Bearer ${await uploadProvider.getToken()}`,
      },
    },
  }
  const lsp4Metadata = await LSP4DigitalAssetMetadata.uploadMetadata(
    {
      LSP4Metadata: metadata,
    },
    uploadOptions
  )

  return lsp4Metadata
}
