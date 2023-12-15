import { PinataPinResponse } from '@pinata/sdk'
import FormData from 'form-data'
import fetch from 'isomorphic-fetch'

const NOT_IMPLEMENTED = 'Not implemented'

export interface AssetBuffer {
  buffer: Buffer
  mimeType: string
}

export type FormDataPostHeaders = Record<string, string | number | any>
export type FormDataRequestOptions = {
  maxContentLength?: number
  maxBodyLength?: number
  withCredentials?: boolean
  headers?: FormDataPostHeaders
}

export const handleError = (error: any) => {
  if (
    error &&
    error.response &&
    error.response &&
    error.response.data &&
    error.response.data.error
  ) {
    return error.response.data.error
  } else if (error.data && error.data.error) {
    return error.data.error
  } else if (error.response && error.response.error) {
    return error.response.error
  }
  return error
}

export class BaseFormDataUploader {
  // Already refactored several times, but still too complex since it needs
  // to handle both node and browser types.
  private populate(
    dataContent: FormData,
    data: any,
    meta?: FormDataPostHeaders
  ): FormDataPostHeaders | undefined {
    if (!('on' in data) && typeof data !== 'string') {
      if ('size' in data && 'type' in data) {
        const blob = data
        meta = {
          'content-type': blob.type,
          ...(blob.name ? { name: blob.name } : {}),
        }
        dataContent.append('file', blob)
      } else if ('buffer' in data && 'mimeType' in data) {
        const assetBuffer = data as AssetBuffer
        meta = { 'content-type': assetBuffer.mimeType }
        dataContent.append(
          'file',
          new (global.Blob || Blob)([assetBuffer.buffer])
        )
      } else if (Buffer.isBuffer(data)) {
        dataContent.append('file', new (global.Blob || Blob)([data]))
      } else if ('on' in data && 'pipe' in data) {
        dataContent.append('file', data)
      } else {
        throw new Error('Unknown upload data format')
      }
    } else {
      dataContent.append('file', data)
    }
    return meta
  }
  async upload(data: any, meta?: FormDataPostHeaders): Promise<string> {
    const dataContent = new FormData()
    meta = this.populate(dataContent, data, meta)
    await this.addMetadata(dataContent as FormData, meta)
    const options = await this.getRequestOptions(dataContent as FormData, meta)
    // This needs to be in a different files for testing with jest to work
    // property. Internal access to internal methods in a file cannot be patched.
    return this.resolveUrl(
      await this.uploadFormData(options, dataContent as FormData)
    )
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async addMetadata(dataContent: FormData, meta?: FormDataPostHeaders) {
    return
  }
  async getRequestOptions(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dataContent: FormData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    meta?: FormDataPostHeaders
  ): Promise<FormDataRequestOptions> {
    return {
      maxContentLength: Number.MAX_SAFE_INTEGER,
      maxBodyLength: Number.MAX_SAFE_INTEGER,
      withCredentials: true,
    }
  }
  getPostEndpoint(): string {
    throw new Error(NOT_IMPLEMENTED)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolveUrl(result: any): string {
    throw new Error(NOT_IMPLEMENTED)
  }
  uploadFormData(
    requestOptions: FormDataRequestOptions,
    dataContent: FormData
  ): Promise<any> {
    const input = {
      method: 'POST',
      ...requestOptions,
    } as RequestInit
    input.headers = { ...input.headers /* ...headers */ }
    return (globalThis.fetch || fetch)(this.getEndpoint(), {
      ...input,
      body: dataContent as any,
    })
      .then(response => {
        if (response.status !== 200) {
          return response.text().then(text => {
            let error = text
            try {
              error = JSON.parse(text)
            } catch {
              // Ignore
            }
            error = (error as any).error || error
            throw new Error(
              `unknown server response while pinning File to IPFS: ${
                error || response.status
              }`
            )
          })
        }
        return response.json() as Promise<PinataPinResponse>
      })
      .catch(function (error) {
        throw handleError(error)
      })
  }
  async getToken(): Promise<string> {
    throw new Error(NOT_IMPLEMENTED)
  }
  getEndpoint(): string {
    throw new Error(NOT_IMPLEMENTED)
  }
}
