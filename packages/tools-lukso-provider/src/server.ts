import {
  JSONRPCErrorResponse,
  JSONRPCServer,
  JSONRPCSuccessResponse,
} from 'json-rpc-2.0'
import { v4 as uuidv4 } from 'uuid'

export class ChannelEntry {
  private readonly accounts: [`0x${string}` | '', `0x${string}` | ''] = ['', '']
  private chainId = 0
  private rpcUrls: string[] = []

  constructor(
    public readonly channel: MessageChannel,
    public readonly toClient: MessagePort,
    public readonly window: Window,
    public readonly element: HTMLIFrameElement | null,
    public readonly id: string,
    public readonly server: JSONRPCServer,
    private readonly getter: () => boolean,
    private readonly setter: (value: boolean) => void
  ) {
    Object.defineProperty(this, 'enabled', {
      get() {
        return this.getter()
      },
      set(value: boolean) {
        if (value !== getter()) {
          this.setter(value)
          this.send('accountsChanged', [
            this.getter() ? this.accounts[0] : '',
            this.accounts[1],
          ])
        }
      },
    })
  }

  public async send(method: string, params: unknown[]): Promise<void> {
    this.channel.port2.postMessage({
      jsonrpc: '2.0',
      id: uuidv4(),
      method,
      params,
    })
  }

  public async allowAccounts(
    [primary, page]: [`0x${string}` | '', `0x${string}` | ''],
    chainId: number
  ): Promise<void> {
    console.log('allowAccounts', primary, page)
    if (this.accounts[0] !== primary || this.accounts[1] !== page) {
      this.accounts[0] = primary
      this.accounts[1] = page
      await this.send('accountsChanged', [this.getter() ? primary : '', page])
    }
    await this.setChainId(chainId)
  }

  public get enabled(): boolean {
    return this.accounts[0] !== '' && this.accounts[1] !== ''
  }

  public async setChainId(chainId: number): Promise<void> {
    if (this.chainId !== chainId) {
      this.chainId = chainId
      await this.send('chainChanged', [chainId])
    }
  }

  public async setRpcUrls(rpcUrls: string[]): Promise<void> {
    if (
      rpcUrls.length !== this.rpcUrls.length ||
      rpcUrls.some((url, index) => url !== this.rpcUrls[index])
    ) {
      this.rpcUrls = rpcUrls
      await this.send('rpcUrlsChanged', rpcUrls)
    }
  }
}

let globalUPProvider: ReturnType<typeof createGlobalUPProvider> | null = null

export function getUPProviderChannel(
  id: string | Window | HTMLIFrameElement
): ChannelEntry | null {
  if (!globalUPProvider) {
    throw new Error('Global UP Provider not set up')
  }
  return globalUPProvider.getChannel(id)
}

export function createGlobalUPProvider(
  _provider?: any,
  _rpcUrls?: string | string[]
) {
  if (globalUPProvider) {
    throw new Error('Global UP Provider already exists')
  }
  const channels = new Map<string, ChannelEntry>()
  let provider: any = _provider ?? null
  let rpcUrls: string[] = Array.isArray(_rpcUrls)
    ? _rpcUrls
    : _rpcUrls != null
      ? [_rpcUrls]
      : []
  let primary: `0x${string}` | '' = ''
  let page: `0x${string}` | '' = ''
  let chainId = 0

  console.log('server listen', window.location.href, window)

  // Server handler to accept new client provider connections
  const providerHandler = (event: MessageEvent) => {
    if (event.data === 'upProvider:hasProvider') {
      let iframe: HTMLIFrameElement | null = null
      for (const element of document.querySelectorAll('iframe')) {
        if (element.contentWindow === event.source) {
          console.log('server hasProvider', element)
          iframe = element
          break
        }
      }
      const previous = iframe
        ? getUPProviderChannel(iframe)
        : getUPProviderChannel(event.source as Window)
      let channelId: string
      let channel: MessageChannel
      const toClient = event.ports[0]
      const server = new JSONRPCServer()
      let enabled = false
      // Server handler to forward requests to the provider
      server.applyMiddleware(async (next, request) => {
        const { method: _method, params: _params, id, jsonrpc } = request
        const method =
          typeof _method === 'string'
            ? _method
            : (_method as unknown as { method: string; params: unknown[] })
                .method
        const params =
          typeof _method === 'string'
            ? _params
            : (_method as unknown as { method: string; params: unknown[] })
                .params
        if (method === 'eth_requestAccounts') {
          console.log('short circuit response', request, [primary, page])
          return {
            ...request,
            result: [enabled ? primary : '', page],
          } as JSONRPCSuccessResponse
        }
        try {
          if (!provider) {
            throw new Error('Global Provider not connected')
          }
          const response = await provider.request({ method, params })
          console.log('response', request, response)
          return { id, jsonrpc, result: response } as JSONRPCSuccessResponse
        } catch (error) {
          if (
            /method (.*?) not supported./.test(
              (error as { message: string }).message || ''
            )
          ) {
            console.error(error)
            const response = { id, jsonrpc, error } as JSONRPCErrorResponse
            console.log('response error', request, response)
            return response
          }
        }
        console.log('request', request)
        // Implement custom methods here.
        if (request.method === 'exampleMethod2') {
          console.log('exampleMethod2')
          return {
            jsonrpc,
            id,
            result: { message: 'Hello, World!' } as any,
          } as JSONRPCSuccessResponse
        }
        return await next(request)
      })
      const channelHandler = (event: MessageEvent) => {
        console.log('server raw', event.data)
        try {
          const request = {
            ...event.data,
            id: `${channelId}:${JSON.stringify(event.data.id)}`,
          }
          server.receive(request).then(response => {
            if (response && typeof response.id === 'string') {
              if (!response.id.startsWith(`${channelId}:`)) {
                console.error(
                  `Invalid response id ${response.id} on channel ${channelId}`
                )
                return
              }
              toClient?.postMessage({
                ...response,
                id: JSON.parse(response.id.replace(`${channelId}:`, '')),
              })
            }
          })
        } catch (error) {
          console.error('Error parsing JSON RPC request', error, event)
        }
      }
      if (previous) {
        channelId = previous.id
        channel = previous.channel
        channel.port1.removeEventListener('message', channelHandler)
        channel.port1.close()
        channel = new MessageChannel()
      } else {
        channelId = uuidv4()
        channel = new MessageChannel()
      }
      const channel_ = new ChannelEntry(
        channel,
        toClient,
        event.source as Window,
        iframe,
        channelId,
        server,
        () => enabled,
        value => {
          enabled = value
        }
      )
      channels.set(channelId, channel_)
      console.log('server hasProvider', event.data, event.ports)
      channel.port1.addEventListener('message', channelHandler)
      channel.port1.start()

      console.log('server accept', channel.port2)
      event.source?.postMessage('upProvider:windowInitialized', {
        transfer: [channel.port2],
      })
    }
  }
  window.addEventListener('message', providerHandler)

  const upProvider = Object.freeze({
    channels,
    close() {
      window.removeEventListener('message', providerHandler)
    },
    get provider(): any {
      return provider
    },
    get primary(): `0x${string}` | '' {
      return primary
    },
    get account1(): `0x${string}` | '' {
      return page
    },
    getChannel(id: string | Window | HTMLIFrameElement): ChannelEntry | null {
      if (typeof id === 'string') {
        return channels.get(id) || null
      }
      for (const item of channels.values()) {
        if (item.window === id || item.element === id) {
          return item
        }
      }
      return null
    },
    async setupProvider(
      _provider: any,
      _rpcUrls: string | string[]
    ): Promise<void> {
      provider = _provider
      const newRpcUrls = Array.isArray(_rpcUrls) ? _rpcUrls : [_rpcUrls]
      if (newRpcUrls.some((url, index) => url !== rpcUrls[index])) {
        rpcUrls = newRpcUrls
        for (const item of channels.values()) {
          await item.setRpcUrls(rpcUrls)
        }
      }
      const _chainId = await provider.request({
        method: 'eth_chainId',
        params: [],
      })
      for (const item of channels.values()) {
        await item.setChainId(chainId)
      }
      const accounts = await provider.request({
        method: 'eth_accounts',
        params: [],
      })
      const _primary = accounts[0] || ''
      if (primary !== _primary || chainId !== _chainId) {
        chainId = _chainId
        primary = _primary
        for (const item of channels.values()) {
          await item.allowAccounts([primary, page], chainId)
        }
      }
      provider.on(
        'accountsChanged',
        async ([_primary]: [`0x${string}` | '']) => {
          if (primary !== _primary) {
            primary = _primary
            for (const item of channels.values()) {
              await item.allowAccounts([primary, page], chainId)
            }
          }
        }
      )
    },
    async injectAddress1(_page: `0x${string}` | ''): Promise<void> {
      if (page !== _page) {
        if (_page !== '' && !/0x[0-9a-f]{40}/i.test(_page)) {
          throw new Error('injectAddress1: invalid address')
        }
        page = _page || ''
        for (const item of channels.values()) {
          await item.allowAccounts([primary, page], chainId)
        }
      }
    },
  })
  globalUPProvider = upProvider
  return upProvider
}
