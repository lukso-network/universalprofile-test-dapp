import FormData from 'form-data'
import crypto from 'isomorphic-webcrypto'
import { FormDataPostHeaders } from '@/services/ipfs/formdata-base-client'
import { CustomHeaderFormDataUploader } from '@/services/ipfs/ipfs-formdata-clients'
import { PUBLIC_API_SHARED_SECRET } from '@/helpers/env'

async function sign(data: any, key: string) {
  return crypto.subtle
    .importKey(
      'jwk', //can be "jwk" or "raw"
      {
        //this is an example jwk key, "raw" would be an ArrayBuffer
        kty: 'oct',
        k: key,
        alg: 'HS256',
        ext: true,
      },
      {
        //this is the algorithm options
        name: 'HMAC',
        hash: { name: 'SHA-256' }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
        //length: 256, //optional, if you want your key length to differ from the hash function's block length
      },
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ['sign', 'verify'] //can be any combination of "sign" and "verify"
    )
    .then((key: any) => {
      const jsonString = JSON.stringify(data)
      const encodedData = new TextEncoder().encode(jsonString)
      return crypto.subtle.sign(
        {
          name: 'HMAC',
        },
        key, //from generateKey or importKey above
        encodedData //ArrayBuffer of data you want to sign
      )
    })
    .then((token: any) => {
      const u8 = new Uint8Array(token)
      const str = String.fromCharCode.apply(
        undefined,
        u8 as unknown as number[]
      )
      return btoa(str)
    })
}

/** local implementation of createToken to create a signed JWT token */
async function createToken(payload: any, key: string): Promise<string> {
  const header = { typ: 'JWT', alg: 'HS256' }

  const segments = [
    encodeURIComponent(btoa(JSON.stringify(header))),
    encodeURIComponent(btoa(JSON.stringify(payload))),
  ]

  const footer = await sign(segments.join('.'), key)

  segments.push(footer)

  return segments.join('.')
}
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
    if (!PUBLIC_API_SHARED_SECRET) {
      return ''
    }
    const now = Date.now()
    return await createToken(
      { iss: 'extension', iat: now / 1000, exp: (now + 120_000) / 1000 },
      PUBLIC_API_SHARED_SECRET || ''
    )
  }
}
