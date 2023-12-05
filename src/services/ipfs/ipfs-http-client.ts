import { create, IPFSHTTPClient, Options } from 'ipfs-http-client'

import {
  BaseFormDataUploader,
  FormDataPostHeaders,
} from '@/services/ipfs/formdata-base-client'

export class HttpIPFSClientUploader extends BaseFormDataUploader {
  private ipfs: IPFSHTTPClient
  constructor(gateway: string | URL | Options) {
    super()
    if (typeof gateway === 'string') {
      const isPortProvided = gateway.split(':').length > 2

      let url: string

      if (gateway.endsWith('/')) {
        url = isPortProvided ? gateway : `${gateway.slice(0, -1)}:${5001}`
      } else {
        url = isPortProvided ? gateway : `${gateway}:${5001}`
      }

      this.ipfs = create({ url })
    } else if (gateway instanceof URL) {
      const { hostname, port, protocol } = gateway
      this.ipfs = create({
        host: hostname,
        port: Number.parseInt(port, 10),
        protocol: protocol,
      })
    } else {
      this.ipfs = create(gateway)
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async upload(data: any, meta?: FormDataPostHeaders): Promise<string> {
    const { cid } =
      (await this.ipfs.add(data, {
        pin: true,
      })) || {}
    if (!cid) {
      throw new Error('IPFS upload failed')
    }
    return `ipfs://${cid.toString()}`
  }
}
