import { JSONRPCErrorResponse, JSONRPCServer, JSONRPCSuccessResponse } from 'json-rpc-2.0'
import { v4 as uuidv4 } from 'uuid'
import EventEmitter3 from 'eventemitter3'

interface ChannelEntryEvents {
  connected: () => void
  disconnected: () => void
  accountsChanged: (accounts: (`0x${string}` | '')[]) => void
  requestAccounts: (accounts: (`0x${string}` | '')[]) => void
  chainChanged: (chainId: number) => void
  injected: (accounts: (`0x${string}` | '')[]) => void
}

class ChannelEntry extends EventEmitter3<ChannelEntryEvents> {
  public readonly accounts: (`0x${string}` | '')[] = []
  private chainId = 0
  private rpcUrls: string[] = []

  constructor(
    public readonly serverChannel: MessagePort,
    public readonly window: Window,
    public readonly element: HTMLIFrameElement | null,
    public readonly id: string,
    public readonly server: JSONRPCServer,
    private readonly getter: () => boolean,
    private readonly setter: (value: boolean) => void
  ) {
    super()
  }

  public async send(method: string, params: unknown[]): Promise<void> {
    this.serverChannel.postMessage({
      jsonrpc: '2.0',
      id: uuidv4(),
      method,
      params,
    })
  }

  public async allowAccounts([primary, ..._page]: (`0x${string}` | '')[], chainId: number): Promise<void> {
    console.log('allowAccounts', primary, _page)
    const primaryChanged = this.accounts[0] !== primary
    const pageChanged = this.accounts.slice(1).some((value, index) => value !== _page[index])
    if (primaryChanged || pageChanged) {
      this.accounts[0] = primary
      this.accounts.length = 1 + (_page.length || 0)
      for (let i = 0; i < (_page?.length || 0); i++) {
        this.accounts[i + 1] = _page[i]
      }
      await this.send('accountsChanged', [this.getter() ? primary : '', ...this.accounts.slice(1)])
      if (primaryChanged) {
        this.emit(this.getter() && this.accounts[0] ? 'connected' : 'disconnected')
      }
      if (pageChanged) {
        this.emit('injected', [..._page])
      }
    }
    await this.setChainId(chainId)
  }

  public get enabled(): boolean {
    return this.getter()
  }

  public set enabled(value: boolean) {
    if (value !== this.enabled) {
      this.setter(value)
      this.send('accountsChanged', [this.getter() ? this.accounts[0] : '', ...this.accounts.slice(1)])
      this.emit(this.getter() && this.accounts[0] ? 'connected' : 'disconnected')
    }
  }

  public async setChainId(chainId: number): Promise<void> {
    if (this.chainId !== chainId) {
      this.chainId = chainId
      await this.send('chainChanged', [chainId])
      this.emit('chainChanged', chainId)
    }
  }

  public async setRpcUrls(rpcUrls: string[]): Promise<void> {
    if (rpcUrls.length !== this.rpcUrls.length || rpcUrls.some((url, index) => url !== this.rpcUrls[index])) {
      this.rpcUrls = rpcUrls
      await this.send('rpcUrlsChanged', rpcUrls)
    }
  }
}

let globalUPProvider: ReturnType<typeof createGlobalUPProvider> | null = null

function getUPProviderChannel(id: string | Window | HTMLIFrameElement | null): ChannelEntry | null {
  if (id == null) {
    return null
  }
  if (!globalUPProvider) {
    throw new Error('Global UP Provider not set up')
  }
  return globalUPProvider.getChannel(id)
}

function createGlobalUPProvider(_provider?: any, _rpcUrls?: string | string[]) {
  if (globalUPProvider) {
    throw new Error('Global UP Provider already exists')
  }
  const channels = new Map<string, ChannelEntry>()
  let provider: any = _provider ?? null
  let rpcUrls: string[] = Array.isArray(_rpcUrls) ? _rpcUrls : _rpcUrls != null ? [_rpcUrls] : []
  let primary: `0x${string}` | '' = ''
  let chainId = 0
  let accounts: (`0x${string}` | '')[] = []
  let promise: Promise<void> = Promise.resolve()

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
      const previous = iframe ? getUPProviderChannel(iframe) : getUPProviderChannel(event.source as Window)
      let channelId: string
      const serverChannel = event.ports[0]
      const server = new JSONRPCServer()
      let enabled = false
      // Server handler to forward requests to the provider
      if (previous) {
        channelId = previous.id
      } else {
        channelId = uuidv4()
      }
      const channel_ = new ChannelEntry(
        serverChannel,
        event.source as Window,
        iframe,
        channelId,
        server,
        () => enabled,
        value => {
          enabled = value
        }
      )
      server.applyMiddleware(async (next, request) => {
        const { method: _method, params: _params, id, jsonrpc } = request
        const method =
          typeof _method === 'string'
            ? _method
            : (
                _method as unknown as {
                  method: string
                  params: unknown[]
                }
              ).method
        const params =
          typeof _method === 'string'
            ? _params
            : (
                _method as unknown as {
                  method: string
                  params: unknown[]
                }
              ).params
        switch (method) {
          case 'chainChanged':
            console.log('short circuit response', request, [chainId])
            channel_.emit('chainChanged', chainId)
            return {
              ...request,
              result: [chainId],
            } as JSONRPCSuccessResponse
          case 'accounts':
            console.log('short circuit response', request, [primary, ...channel_.accounts.slice(1)])
            channel_.emit('requestAccounts', [enabled ? primary : '', ...channel_.accounts.slice(1)])
            return {
              ...request,
              result: [enabled ? primary : '', ...channel_.accounts.slice(1)],
            } as JSONRPCSuccessResponse
          case 'eth_requestAccounts':
            console.log('short circuit response', request, [primary, ...channel_.accounts.slice(1)])
            channel_.emit('requestAccounts', [enabled ? primary : '', ...channel_.accounts.slice(1)])
            return {
              ...request,
              result: [enabled ? primary : '', ...channel_.accounts.slice(1)],
            } as JSONRPCSuccessResponse
          case 'eth_chainId':
            return {
              ...request,
              result: chainId,
            } as JSONRPCSuccessResponse
          case 'eth_accounts':
            channel_.emit('accountsChanged', [enabled ? primary : '', ...channel_.accounts.slice(1)])
            return {
              ...request,
              result: [enabled ? primary : '', ...channel_.accounts.slice(1)],
            } as JSONRPCSuccessResponse
        }
        try {
          if (!provider) {
            throw new Error('Global Provider not connected')
          }
          const response = await provider.request({ method, params })
          console.log('response', request, response)
          return {
            id,
            jsonrpc,
            result: response,
          } as JSONRPCSuccessResponse
        } catch (error) {
          if (/method (.*?) not supported./.test((error as { message: string }).message || '')) {
            console.error(error)
            const response = {
              id,
              jsonrpc,
              error,
            } as JSONRPCErrorResponse
            console.log('response error', request, response)
            return response
          }
        }
        console.log('request', request)
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
                console.error(`Invalid response id ${response.id} on channel ${channelId}`)
                return
              }
              serverChannel?.postMessage({
                ...response,
                id: JSON.parse(response.id.replace(`${channelId}:`, '')),
              })
            }
          })
        } catch (error) {
          console.error('Error parsing JSON RPC request', error, event)
        }
      }
      channels.set(channelId, channel_)
      console.log('server hasProvider', event.data, event.ports)
      serverChannel.addEventListener('message', channelHandler)
      serverChannel.start()

      console.log('server accept', serverChannel)
      serverChannel?.postMessage({ type: 'upProvider:windowInitialized', chainId, accounts, rpcUrls })
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
    get accounts(): (`0x${string}` | '')[] {
      return [primary || '', ...accounts.slice(1)]
    },
    getChannel(id: string | Window | HTMLIFrameElement | null): ChannelEntry | null {
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
    async injectAddresses(...page: (`0x${string}` | '')[]) {
      const changed = accounts.slice(1).some((value, index) => page?.[index] !== value)
      if (changed) {
        accounts = [accounts[0], ...page]
        for (const item of channels.values()) {
          await item.allowAccounts([primary, ...accounts.slice(1)], chainId)
        }
      }
    },
    async setupProvider(_provider: any, _rpcUrls: string | string[]): Promise<void> {
      promise = new Promise<void>((resolve, reject) => {
        ;(async () => {
          try {
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
            const _accounts = await provider.request({
              method: 'eth_accounts',
              params: [],
            })
            const _primary = _accounts[0] || ''
            if (primary !== _primary || chainId !== _chainId) {
              chainId = _chainId
              primary = _primary
              accounts[0] = _primary
              for (const item of channels.values()) {
                await item.allowAccounts([primary, ...accounts.slice(1)], chainId)
              }
            }
            provider.on('accountsChanged', async ([_primary]: [`0x${string}` | '']) => {
              if (primary !== _primary) {
                primary = _primary
                for (const item of channels.values()) {
                  await item.allowAccounts([primary, ...accounts.slice(1)], chainId)
                }
              }
            })
            resolve()
          } catch (err) {
            reject(err)
          }
        })()
      })
    },
  })
  globalUPProvider = upProvider
  return upProvider
}

export { ChannelEntry, getUPProviderChannel, createGlobalUPProvider }
