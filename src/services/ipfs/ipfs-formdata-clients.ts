import FormData from 'form-data'

import {
  BaseFormDataUploader,
  FormDataPostHeaders,
  FormDataRequestOptions,
} from '@/services/ipfs/formdata-base-client'

export class CustomHeaderFormDataUploader extends BaseFormDataUploader {
  constructor(
    private endpoint: string,
    private headers: FormDataPostHeaders
  ) {
    super()
  }
  async getRequestOptions(
    _dataContent: FormData,
    meta?: FormDataPostHeaders
  ): Promise<FormDataRequestOptions> {
    const rest = await super.getRequestOptions(_dataContent, meta)
    const headers = await this.getHeaders(_dataContent, meta)
    return { ...rest, headers: { ...headers } }
  }
  getEndpoint(): string {
    return this.endpoint
  }
  async getToken(): Promise<string> {
    return this.headers.Authorization.replace('Bearer ', '')
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getHeaders(dataContent: FormData, meta?: FormDataPostHeaders) {
    return this.headers
  }
}
