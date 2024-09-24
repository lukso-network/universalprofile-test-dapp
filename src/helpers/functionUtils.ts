import { LSPType } from '@/helpers/tokenUtils'
import { SIGNATURE_LOOKUP_URL } from '@/helpers/config'
import Web3 from 'web3'
import { Unit, isAddress } from 'web3-utils'

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
  to?: string
  amount?: string
}

const SIGNATURE_CACHE = 'signature-cache2'

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
    },
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

export function getSelectorLookupURL(selector: string) {
  return `${SIGNATURE_LOOKUP_URL}?hex_signature=${selector}`
}

export const decodeData = async (
  eth: Web3['eth'],
  _data: string
): Promise<MethodSelect> => {
  let data = _data
  if (data?.startsWith('0x')) {
    data = data.substring(2)
  }
  const selector = data?.substring(0, 8)
  if (selector) {
    let signatureCache: Cache | undefined = undefined
    try {
      signatureCache = await caches.open(SIGNATURE_CACHE)
    } catch {}
    const url = getSelectorLookupURL(selector)
    const functionSignatureResponse = await signatureCache?.match(url)

    let functionSignatures: string[] = []
    if (functionSignatureResponse) {
      const response = await functionSignatureResponse.json()
      if (response.functionSignature) {
        functionSignatures.push(response.functionSignature)
      }
    }
    if (functionSignatures.length === 0) {
      const methods = await fetcher<BytesSignatureResponse, void>({
        method: 'GET',
        url,
      })
      functionSignatures = methods.results.map(result => result.text_signature)
    }

    if (functionSignatures.length > 0) {
      for (const functionSignature of functionSignatures.reverse()) {
        try {
          const params: string[] = functionSignature
            .replace(/^[^(]*\(|\)[^)]*$/g, '')
            .split(',')
          const args = eth.abi.decodeParameters(params, data.substring(8)) || {}
          const encodeArgs = Array(params.length)
            .fill(null)
            .map((_val, index) => {
              if (params[index] === 'bool') {
                const val = args[`${index}`]
                if (val !== 1 && val !== 0) {
                  // Due to javascript truthyness any non-empty or non-zero value is encoded as true without a problem.
                  // The output packet won't match but there is really no reason to even try.
                  throw new Error('Invalid boolean value')
                }
              }
              if (params[index] === 'address') {
                const val = args[`${index}`]
                if (!isAddress(val)) {
                  // Due to javascript truthyness any non-empty or non-zero value is encoded as true without a problem.
                  // The output packet won't match but there is really no reason to even try.
                  throw new Error('Invalid address value')
                }
              }
              return args[`${index}`] ?? '0x'
            })
          const newData =
            eth.abi.encodeParameters(params, encodeArgs).substring(2) || '0x'
          if (data.substring(8) === newData) {
            const call = functionSignature.replace(/\(.*$/, '')
            const item = {
              label: `Decoded ${functionSignature}`,
              functionSignature: functionSignature,
              call,
              inputs: params.map((type, index) => ({
                type,
                name: `arg${index + 1}`,
                value: args[index],
                isKey:
                  /^bytes32/.test(type) &&
                  call in { setData: true, getData: true },
              })),
            }
            await signatureCache?.put(url, new Response(JSON.stringify(item)))
            return item
          }
        } catch (err) {
          // Ignore to try next record
        }
      }
    }
  }
  throw new Error('Unable to decode data')
}
