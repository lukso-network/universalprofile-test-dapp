import { LSPType } from '@/helpers/tokenUtils'
import Web3 from 'web3'
import { Unit } from 'web3-utils'
import { getSelectorLookupURL } from './config'

export type MethodType = {
  label?: string
  type: string
  name: string
  isWei?: Unit
  hasSpecs?: LSPType[]
  isPairs?: boolean
  isKey?: boolean
  value?: any
}
export type MethodSelect = {
  label: string
  call?: string
  inputs?: MethodType[]
  hasSpecs?: LSPType[]
}

const SIGNATURE_CACHE = 'signature-cache'

type BytesSignatureResponse = {
  count: number
  next: unknown
  previous: unknown
  results: [
    {
      id: number
      created_at: string
      text_signature: string
      hex_signature: string
      bytes_signature: string
    }
  ]
}

const fetcher = async <Response, Request>(config: {
  url: string
  method: 'GET' | 'POST'
  data?: Request
  headers?: Record<string, never>
}): Promise<Response> => {
  const fetchConfig: RequestInit = {
    method: config.method,
    headers: config.headers || {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }
  if (config.data) {
    fetchConfig.body = JSON.stringify(config.data)
  }

  const response = await fetch(config.url, fetchConfig)

  if (!response.ok) {
    return response
      .json()
      .catch(() => {
        throw new Error(response.status.toString())
      })
      .then(message => {
        throw message
      })
  }
  return await response.json()
}

export const decodeData = async (
  eth: Web3['eth'],
  data: string
): Promise<MethodSelect> => {
  if (/^0x/i.test(data)) {
    data = data.substring(2)
  }
  const selector = data?.substring(0, 8)
  if (selector) {
    const signatureCache = await caches.open(SIGNATURE_CACHE)
    const url = getSelectorLookupURL(selector)
    const functionSignatureResponse = await signatureCache.match(url)
    if (functionSignatureResponse) {
      return await functionSignatureResponse.json()
    }

    const methods = await fetcher<BytesSignatureResponse, void>({
      method: 'GET',
      url,
    })

    if (methods && methods.results.length > 0) {
      for (const result of methods.results) {
        try {
          const params: string[] = result.text_signature
            .replace(/^[^(]*\(|\)[^)]*$/g, '')
            .split(',')
          const args = eth.abi.decodeParameters(params, data.substring(8))
          const encodeArgs = Array(params.length)
            .fill(null)
            .map((_val, index) => args[`${index}`] ?? '0x')
          const newData = eth.abi
            .encodeParameters(params, encodeArgs)
            .substring(2)
          if (data.substring(8) === newData) {
            const item = {
              label: `Decoded ${result.text_signature.replace(/\(.*$/, '')}`,
              call: result.text_signature.replace(/\(.*$/, ''),
              inputs: params.map((type, index) => ({
                type,
                name: `arg${index + 1}`,
                value: args[index],
              })),
            }
            await signatureCache.put(url, new Response(JSON.stringify(item)))
            return item
          }
        } catch (err) {
          // Ignore to try next record
          console.error(err)
        }
      }
    }
  }
  throw new Error(`Unable to decode data`)
}
