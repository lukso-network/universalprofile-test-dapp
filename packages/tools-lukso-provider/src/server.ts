import { JSONRPCErrorResponse, JSONRPCServer, JSONRPCSuccessResponse } from 'json-rpc-2.0'
import { v4 as uuidv4 } from 'uuid'
import EventEmitter3, { EventEmitter } from 'eventemitter3'
import debug from 'debug'

const serverLog = debug('upProvider:server')
interface UPClientChannelEvents {
  connected: () => void
  disconnected: () => void
  accountsChanged: (accounts: (`0x${string}` | '')[]) => void
  requestAccounts: (accounts: (`0x${string}` | '')[]) => void
  chainChanged: (chainId: number) => void
  injected: (accounts: (`0x${string}` | '')[]) => void
}

class UPClientChannel extends EventEmitter3<UPClientChannelEvents> {
  #accounts: (`0x${string}` | '')[] = []
  #chainId = 0
  #rpcUrls: string[] = []
  #buffered?: Array<[keyof UPClientChannelEvents, unknown[]]> = []
  #serverChannel: MessagePort
  #server: JSONRPCServer
  readonly #getter: () => boolean
  readonly #setter: (value: boolean) => void

  constructor(
    serverChannel: MessagePort,
    public readonly window: Window,
    public readonly element: HTMLIFrameElement | null,
    public readonly id: string,
    server: JSONRPCServer,
    getter: () => boolean,
    setter: (value: boolean) => void
  ) {
    super()
    this.#getter = getter
    this.#setter = setter
    this.#serverChannel = serverChannel
    this.#server = server
  }

  get accounts(): (`0x${string}` | '')[] {
    const value = this.#accounts
    return [...value]
  }

  emit<T extends EventEmitter.EventNames<UPClientChannelEvents>>(event: T, ...args: EventEmitter.EventArgs<UPClientChannelEvents, T>): boolean {
    if (this.#buffered) {
      this.#buffered.push([event, args])
      return false
    }
    return super.emit(event, ...args)
  }

  resume(delay = 0) {
    const buffered = this.#buffered
    if (!buffered) {
      return
    }
    this.#buffered = undefined
    setTimeout(() => {
      while (buffered.length > 0) {
        const val = buffered.shift()
        if (val) {
          const [event, args] = val
          super.emit(event, ...(args as any))
        }
      }
    }, delay)
  }

  public async send(method: string, params: unknown[]): Promise<void> {
    this.#serverChannel.postMessage({
      jsonrpc: '2.0',
      id: uuidv4(),
      method,
      params,
    })
  }

  public async allowAccounts(enabled: boolean, [primary, ..._page]: (`0x${string}` | '')[], chainId: number): Promise<void> {
    serverLog('allowAccounts', primary, _page)
    const primaryChanged = this.#accounts[0] !== primary || this.#getter() !== enabled
    const pageChanged = this.#accounts.slice(1).some((value, index) => value !== _page[index])
    this.#setter(enabled)
    if (primaryChanged || pageChanged) {
      this.#accounts[0] = primary
      this.#accounts.length = 1 + (_page.length || 0)
      for (let i = 0; i < (_page?.length || 0); i++) {
        this.#accounts[i + 1] = _page[i]
      }
      await this.send('accountsChanged', [this.#getter() ? primary : '', ...this.#accounts.slice(1)])
      if (primaryChanged) {
        this.emit(this.#getter() && this.#accounts[0] ? 'connected' : 'disconnected')
      }
      if (pageChanged) {
        this.emit('injected', [..._page])
      }
    }
    await this.setChainId(chainId)
  }

  public get enabled(): boolean {
    return this.#getter()
  }

  public set enabled(value: boolean) {
    if (value !== this.enabled) {
      this.#setter(value)
      this.send('accountsChanged', [this.#getter() ? this.accounts[0] : '', ...this.accounts.slice(1)])
      this.emit(this.#getter() && this.accounts[0] ? 'connected' : 'disconnected')
    }
  }

  public async setChainId(chainId: number): Promise<void> {
    if (this.#chainId !== chainId) {
      this.#chainId = chainId
      await this.send('chainChanged', [chainId])
      this.emit('chainChanged', chainId)
    }
  }

  public async setRpcUrls(rpcUrls: string[]): Promise<void> {
    if (rpcUrls.length !== this.#rpcUrls.length || rpcUrls.some((url, index) => url !== this.#rpcUrls[index])) {
      this.#rpcUrls = rpcUrls
      await this.send('rpcUrlsChanged', rpcUrls)
    }
  }

  public close() {
    const el: any = this.element || this.window
    if (el.upChannel === this) {
      delete el.upChannel
    }
    this.#serverChannel.close()
  }
}

type GlobalProviderOptions = {
  providerHandler?: (e: MessageEvent) => void
  accounts: (`0x${string}` | '')[]
  provider: any
  primary: `0x${string}` | ''
  promise: Promise<void>
  rpcUrls: string[]
  chainId: number
}

interface GlobalProviderEvents {
  channelCreated: (id: HTMLIFrameElement | Window | string, channel: UPClientChannel) => void
}

export class GlobalProvider extends EventEmitter3<GlobalProviderEvents> {
  #options: GlobalProviderOptions
  #channels: Map<string, UPClientChannel>

  constructor(channels: Map<string, UPClientChannel>, options: any) {
    super()
    this.#channels = channels
    this.#options = options as GlobalProviderOptions
  }

  close() {
    if (this.#options.providerHandler) {
      window.removeEventListener('message', this.#options.providerHandler)
    }
  }

  get provider(): any {
    return this.#options.provider
  }

  get accounts(): (`0x${string}` | '')[] {
    return [this.#options.primary || '', ...this.#options.accounts.slice(1)]
  }

  /**
   * Get a map of all clients by their ID.
   */
  get channels(): Map<string, UPClientChannel> {
    return new Map(this.#channels)
  }

  /**
   * Find the client for the element, window or proxy object of the client.
   * @param _id
   * @returns actual UPClientChannel
   */
  getChannel(_id: string | Window | HTMLIFrameElement | UPClientChannel | null): UPClientChannel | null {
    let id = _id
    if (typeof id === 'string') {
      return this.#channels.get(id) || null
    }
    if ('element' in (id as any) || 'window' in (id as any)) {
      id = (id as UPClientChannel).element || (id as UPClientChannel).window
    }
    for (const item of this.#channels.values()) {
      if (item.window === id || item.element === id) {
        return item
      }
    }
    return null
  }

  /**
   * Inject additional addresses into the client's accountsChanged event.
   * Account[0] will be linked to the signed when making transactions.
   * Starting at Account[1] is where additional addresses are injected.
   * This routine injects on all connections. You can also inject using
   * the channel's allowAccounts method.
   * @param page list of addresses
   */
  async injectAddresses(...page: (`0x${string}` | '')[]) {
    const changed = this.#options.accounts.slice(1).some((value, index) => page?.[index] !== value)
    if (changed) {
      this.#options.accounts = [this.#options.primary, ...page]
      for (const item of this.channels.values()) {
        await item.allowAccounts(item.enabled, [this.#options.primary, ...this.#options.accounts.slice(1)], this.#options.chainId)
      }
    }
  }

  /**
   * Connect this provider externally. This will be called during initial construction
   * but can be called at a later time if desired to re-initialize or tear down
   * the connection.
   * @param _provider
   * @param _rpcUrls
   */
  async setupProvider(_provider: any, _rpcUrls: string | string[]): Promise<void> {
    this.#options.promise = new Promise<void>((resolve, reject) => {
      ;(async () => {
        try {
          this.#options.provider = _provider
          const newRpcUrls = Array.isArray(_rpcUrls) ? _rpcUrls : [_rpcUrls]
          if (newRpcUrls.some((url, index) => url !== this.#options.rpcUrls[index])) {
            this.#options.rpcUrls = newRpcUrls
            for (const item of this.channels.values()) {
              await item.setRpcUrls(this.#options.rpcUrls)
            }
          }
          const _chainId = await this.#options.provider.request({
            method: 'eth_chainId',
            params: [],
          })
          for (const item of this.channels.values()) {
            await item.setChainId(this.#options.chainId)
          }
          const _accounts = await this.#options.provider.request({
            method: 'eth_accounts',
            params: [],
          })
          const _primary = _accounts[0] || ''
          if (this.#options.primary !== _primary || this.#options.chainId !== _chainId) {
            this.#options.chainId = _chainId
            this.#options.primary = _primary
            this.#options.accounts[0] = _primary
            for (const item of this.channels.values()) {
              await item.allowAccounts(item.enabled, [this.#options.primary, ...this.#options.accounts.slice(1)], this.#options.chainId)
            }
          }
          this.#options.provider.on('accountsChanged', async ([_primary]: [`0x${string}` | '']) => {
            if (this.#options.primary !== _primary) {
              this.#options.primary = _primary
              this.#options.accounts[0] = _primary
              for (const item of this.channels.values()) {
                await item.allowAccounts(item.enabled, [this.#options.primary, ...this.#options.accounts.slice(1)], this.#options.chainId)
              }
            }
          })
          resolve()
        } catch (err) {
          reject(err)
        }
      })()
    })
  }
}

let globalUPProvider: GlobalProvider | null = null

/**
 * Global method to find channel in case `up-channel-connected` event was missed.
 *
 * @param id how to find the UPClientChannel instance (this can be the id, frame (not the frame's element id) or window)
 * @returns UPClientChannel
 */
function getUPProviderChannel(id: string | Window | HTMLIFrameElement | UPClientChannel | null): UPClientChannel | null {
  if (id == null) {
    return null
  }
  if (!globalUPProvider) {
    throw new Error('Global UP Provider not set up')
  }
  return globalUPProvider.getChannel(id)
}

/**
 * Install a global UPProvider inside of the particular window which will listen for client
 * connections and establish them. It will fire `up-channel-connected` on the particular iframe if it's reachable.
 * It will fire a local `channelCreated` event as well.
 *
 * @param _provider the initial provider to proxy
 * @param _rpcUrls rpc urls to give to the clients to locally connect for non eth_sendTransaction and so on.
 * @returns The global provider and event sing for `channelCreated` events.
 */
function createGlobalUPProvider(_provider?: any, _rpcUrls?: string | string[]): GlobalProvider {
  if (globalUPProvider) {
    return globalUPProvider
  }
  const channels = new Map<string, UPClientChannel>()

  // Allow for late initialization of class properties.
  const options: GlobalProviderOptions = {
    provider: _provider ?? null,
    rpcUrls: Array.isArray(_rpcUrls) ? _rpcUrls : _rpcUrls != null ? [_rpcUrls] : [],
    primary: '',
    chainId: 0,
    accounts: [],
    promise: Promise.resolve(),
  }
  globalUPProvider = new GlobalProvider(channels, options)

  serverLog('server listen', window.location.href, window)

  // Server handler to accept new client provider connections
  options.providerHandler = (event: MessageEvent) => {
    if (event.data === 'upProvider:hasProvider') {
      let iframe: HTMLIFrameElement | null = null
      for (const element of document.querySelectorAll('iframe')) {
        if (element.contentWindow === event.source) {
          serverLog('server hasProvider', element)
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

      // Wrapper for representation of client connection inside of global provider space.
      const channel_ = new UPClientChannel(
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
        await options.promise
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
            serverLog('short circuit response', request, [options.chainId])
            channel_.emit('chainChanged', options.chainId)
            return {
              ...request,
              result: [options.chainId],
            } as JSONRPCSuccessResponse
          case 'accounts':
            serverLog('short circuit response', request, [options.primary, ...channel_.accounts.slice(1)])
            channel_.emit('requestAccounts', [enabled ? options.primary : '', ...channel_.accounts.slice(1)])
            return {
              ...request,
              result: [enabled ? options.primary : '', ...channel_.accounts.slice(1)],
            } as JSONRPCSuccessResponse
          case 'eth_requestAccounts':
            serverLog('short circuit response', request, [options.primary, ...channel_.accounts.slice(1)])
            channel_.emit('requestAccounts', [enabled ? options.primary : '', ...channel_.accounts.slice(1)])
            return {
              ...request,
              result: [enabled ? options.primary : '', ...channel_.accounts.slice(1)],
            } as JSONRPCSuccessResponse
          case 'eth_chainId':
            return {
              ...request,
              result: options.chainId,
            } as JSONRPCSuccessResponse
          case 'eth_accounts':
            channel_.emit('accountsChanged', [enabled ? options.primary : '', ...channel_.accounts.slice(1)])
            return {
              ...request,
              result: [enabled ? options.primary : '', ...channel_.accounts.slice(1)],
            } as JSONRPCSuccessResponse
        }
        try {
          if (!options.provider) {
            throw new Error('Global Provider not connected')
          }
          const response = await options.provider.request({ method, params })
          serverLog('response', request, response)
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
            serverLog('response error', request, response)
            return response
          }
        }
        serverLog('request', request)
        return await next(request)
      })

      const channelHandler = (event: MessageEvent) => {
        if (event.data.type === 'upProvider:windowInitialized') {
          serverLog('channel created', event.data.type, event.data)
          globalUPProvider?.emit('channelCreated', channel_.element || channel_.window || null, channel_)
          const destination = channel_.element || channel_.window || null
          if (destination != null) {
            ;(destination as any).upChannel = channel_
            const event = new CustomEvent('up-channel-connected', {
              detail: {
                channel: channel_,
                chainId: options.chainId,
                accounts: options.accounts,
                rpcUrls: options.rpcUrls,
                enabled: channel_.enabled,
              },
            })
            destination.dispatchEvent(event)
          }
          return
        }
        serverLog('server raw', event.data)
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
      serverLog('server hasProvider', event.data, event.ports)
      serverChannel.addEventListener('message', channelHandler)
      serverChannel.start()

      serverLog('server accept', serverChannel)
      serverChannel?.postMessage({ type: 'upProvider:windowInitialize', chainId: options.chainId, accounts: options.accounts, rpcUrls: options.rpcUrls })
      channel_.emit('connected')
    }
  }
  window.addEventListener('message', options.providerHandler)
  return globalUPProvider
}

export { UPClientChannel, getUPProviderChannel, createGlobalUPProvider }
