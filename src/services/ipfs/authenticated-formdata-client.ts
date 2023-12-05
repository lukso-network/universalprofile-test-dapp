import FormData from 'form-data'

import { FormDataPostHeaders } from '@/services/ipfs/formdata-base-client'
import { CustomHeaderFormDataUploader } from '@/services/ipfs/ipfs-formdata-clients'
import { PUBLIC_API_SHARED_SECRET } from '@/helpers/env'

export class AuthenticatedFormDataUploader extends CustomHeaderFormDataUploader {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getHeaders(dataContent: FormData, meta?: FormDataPostHeaders) {
    const jwt = await this.getToken()
    return { Authorization: `Bearer ${jwt}` }
  }
  resolveUrl(result: any): string {
    return `ipfs://${result.IpfsHash}`
  }
  async getToken(): Promise<string> {
    const sign = await import('@tsndr/cloudflare-worker-jwt').then(
      m => m.sign || m.default?.sign
    )

    const now = Date.now()
    const secret = PUBLIC_API_SHARED_SECRET
    return await sign(
      { iss: 'extension', iat: now / 1000, exp: (now + 120_000) / 1000 },
      secret || ''
    )
  }
}
