import { JSONRPCClient, JSONRPCParams } from 'json-rpc-2.0'
import { v4 as uuidv4 } from 'uuid'
import EventEmitter3 from 'eventemitter3'
import debug from 'debug'

const clientLog = debug('upProvider:client')

type RequestQueueItem = {
  resolve: () => unknown
  reject: (reason: unknown) => unknown
  sent: boolean
  id: number | string
  method: string
  params: unknown[]
}

interface UPClientProviderEvents {
  connected: () => void
  disconnected: () => void
  accountsChanged: (accounts: (`0x${string}` | '')[]) => void
  requestAccounts: (accounts: (`0x${string}` | '')[]) => void
  chainChanged: (chainId: number) => void
  injected: (page: `0x${string}` | '') => void
  rpcUrls: (rpcUrls: string[]) => void
}

type UPClientProviderOptions = {
  client?: JSONRPCClient
  chainId: () => number
  accounts: () => (`0x${string}` | '')[]
  window?: Window
  clientChannel?: MessagePort
  startupPromise: Promise<void>
  init?: { chainId: number; accounts: (`0x${string}` | '')[]; rpcUrls: string[] }
}

const pendingRequests = new Map<string, RequestQueueItem>()
export class UPClientProvider extends EventEmitter3<UPClientProviderEvents> {
  readonly #options: UPClientProviderOptions
  constructor(options: any) {
    super()
    this.#options = options as UPClientProviderOptions
  }

  get clientChannel(): MessagePort | null {
    return this.#options?.clientChannel || null
  }

  async request(method: string, params: JSONRPCParams, clientParams: any): Promise<any> {
    await this.#options?.startupPromise
    return this.#options?.client?.request(method, params, clientParams) || null
  }

  get chainId() {
    return this.#options?.chainId() || 0
  }

  get accounts() {
    return this.#options?.accounts() || []
  }
}

let singletonUPClientProvider: UPClientProvider | null = null

async function testWindow(_up: Window | undefined | null, remote: UPClientProvider, options: UPClientProviderOptions): Promise<UPClientProvider> {
  const up = _up || (typeof window !== 'undefined' ? window : undefined)
  if (!up) {
    throw new Error('No UP found')
  }
  return new Promise<UPClientProvider>((resolve, reject) => {
    let timeout: number | NodeJS.Timeout = 0
    const channel = new MessageChannel()

    const testFn = (event: MessageEvent) => {
      if (event.data?.type === 'upProvider:windowInitialize') {
        const { chainId, accounts, rpcUrls } = event.data

        clientLog('client init', event.data, up)
        up.removeEventListener('message', testFn)
        if (timeout) {
          clearTimeout(timeout)
          timeout = 0
        }
        options.clientChannel = channel.port1
        options.window = up
        options.init = { chainId, accounts, rpcUrls }
        clientLog('client connected', event.data.type, event.data)
        options.clientChannel.postMessage({ type: 'upProvider:windowInitialized', chainId, accounts, rpcUrls })
        resolve(remote)
      }
    }

    channel.port1.addEventListener('message', testFn)
    channel.port1.start()
    window.addEventListener('message', testFn)
    clientLog('client', 'send find wallet', up.location.href, up)
    up.postMessage('upProvider:hasProvider', '*', [channel.port2])

    timeout = setTimeout(() => {
      timeout = 0
      window.removeEventListener('message', testFn)
      channel.port1.removeEventListener('message', testFn)

      clientLog('client', 'No UP found', up.location.href, up)
      reject(new Error('No UP found'))
    }, 1000)
  })
}

async function findUP(authURL: string | Window | undefined | null, remote: UPClientProvider, options: UPClientProviderOptions): Promise<UPClientProvider> {
  let current = window.opener || window.parent || singletonUPClientProvider
  if (current) {
    const up = await testWindow(current, remote, options)
    if (up) {
      singletonUPClientProvider = up
      return up
    }
  }
  if (authURL == null) {
    throw new Error('No UP found')
  }
  if (typeof authURL === 'object' && authURL instanceof Window) {
    throw new Error('No UP found')
  }
  current = window.open(authURL, 'UE Wallet', 'width=400,height=600')
  if (current) {
    const up = await testWindow(current, remote, options)
    if (singletonUPClientProvider) {
      singletonUPClientProvider = up
      return up
    }
  }
  throw new Error('No UP found')
}

async function findDestination(authURL: string | Window | undefined | null, remote: UPClientProvider, options: UPClientProviderOptions, search = false): Promise<UPClientProvider> {
  let up: UPClientProvider | undefined =
    (typeof authURL === 'object' && authURL instanceof Window) || authURL == null
      ? await testWindow(authURL, remote, options).catch(error => {
          if (search) {
            return undefined
          }
          throw error
        })
      : await findUP(authURL, remote, options)

  if (search && !up) {
    let retry = 3
    while (retry > 0) {
      let current: Window | undefined = window.opener && window.opener !== window ? window.opener : window.parent && window.parent !== window ? window.parent : undefined
      clientLog('search', current?.location.href)
      while (current) {
        up = await testWindow(current, remote, options).catch(() => undefined)
        if (up) {
          break
        }
        if (current === window.top) {
          break
        }
        clientLog('current', current.location.href)
        current = current.opener && current.opener !== current ? current.opener : current.parent && current.parent !== current ? current.parent : null
        clientLog('next', current?.location.href)
      }
      if (up) {
        break
      }

      await new Promise(resolve => setTimeout(resolve, 1000))

      retry--
    }
  }
  if (!up) {
    throw new Error('No UP found')
  }
  return up
}

/**
 * Create clientUPProvider. This can be used like a normal window.ethereum or window.lukso provider.
 * It will on initialization look for a connection to a global provider.
 *
 * @param authURL Optionally put a URL to a authentication provider to provide the global provider.
 * @param search If false then don't search but take the passed in value as is.
 * @returns the client UPProvider
 */
export function createClientUPProvider(authURL?: string | Window, search = true): UPClientProvider {
  let chainId = 0
  let accounts: (`0x${string}` | '')[] = []
  let rpcUrls: string[] = []
  let startupResolve: () => void

  const startupPromise = new Promise<void>(resolve => {
    startupResolve = resolve
  })

  const options: UPClientProviderOptions = {
    chainId: () => chainId,
    accounts: () => accounts,
    startupPromise,
  }

  const remote = new UPClientProvider(options)
  let searchPromise: Promise<UPClientProvider> | null

  const doSearch = async (client: JSONRPCClient): Promise<UPClientProvider> => {
    if (searchPromise) {
      return searchPromise
    }
    searchPromise = findDestination(authURL, remote, options, search).then(up => {
      const init: { chainId: number; accounts: (`0x${string}` | '')[]; rpcUrls: string[] } | undefined = options.init
      if (init) {
        ;({ chainId, accounts, rpcUrls } = init || {})
      }
      up.clientChannel?.addEventListener('message', event => {
        try {
          const response = event.data
          clientLog('client', response)
          switch (response.method) {
            case 'chainChanged':
              chainId = response.params[0]
              up.emit('chainChanged', chainId)
              return
            case 'accountsChanged':
              accounts = response.params
              up.emit('accountsChanged', accounts)
              return
            case 'rpcUrlsChanged':
              rpcUrls = response.params
              up.emit('rpcUrls', rpcUrls)
              return
          }
          const item = pendingRequests.get(response.id)
          if (response.id && item) {
            const { resolve, reject } = item
            if (response.result) {
              client.receive({ ...response, id: item.id }) // Handle the response
              resolve() // Resolve the corresponding promise
            } else if (response.error) {
              const { error: _error, jsonrpc } = response
              const { method, params, id } = item
              const error = {
                ..._error,
                message: `${_error.message} ${JSON.stringify(method)}(${JSON.stringify(params)})`,
              }
              // This is a real error log (maybe goes to sentry)
              console.error('error', { error, method, params, id, jsonrpc })
              client.receive({ ...response, id: item.id })
              reject(error) // Reject in case of error
            }
            pendingRequests.delete(response.id) // Clean up the request
          }
        } catch (error) {
          // This is a real error log (maybe goes to sentry)
          console.error('Error parsing JSON RPC response', error, event)
        }
      })
      up.clientChannel?.start()
      options.client = client

      startupResolve()

      return up
    })

    return searchPromise
  }

  const client = new JSONRPCClient(async (jsonRPCRequest: any) => {
    const up = await doSearch(client).then(up => {
      options.client = client
      return up
    })

    return new Promise((resolve, reject) => {
      const { id, method, params } = jsonRPCRequest

      pendingRequests.set(id, {
        resolve,
        reject,
        sent: false,
        id,
        method,
        params,
      })

      up.clientChannel?.postMessage(jsonRPCRequest)
    })
  })

  const request_ = client.request.bind(client)

  const wrapper = async (method: string, params: unknown[]) => {
    switch (method) {
      case 'eth_call':
        if (rpcUrls.length > 0) {
          clientLog('client direct rpc', rpcUrls, method, params)

          const urls = [...rpcUrls]
          const errors = []
          while (urls.length > 0) {
            const url = urls.shift()
            try {
              if (!url) {
                throw new Error('No RPC URL found')
              }

              const result = fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  id: uuidv4(),
                  method,
                  params,
                }),
              }).then(response => {
                if (response.ok) {
                  return response.json()
                }
                throw new Error('Network response was not ok')
              })

              return result
            } catch (error) {
              // This is a real error log (maybe goes to sentry)
              console.error('error', error)
              errors.push(error)
            }
          }
          const err: any = new Error(`All RPC URLs failed: ${errors.map(e => (e as { message: string }).message).join(', ')}`)
          err.errors = errors
          throw err
        }
    }
    return request_(method, params)
  }

  client.request = async (method, params) => {
    await doSearch(client)

    await startupPromise

    // make it compatible with old and new type RPC.
    if (typeof method === 'string') {
      return await wrapper(method, params)
    }
    const { method: _method, params: _params } = method as {
      method: string
      params: unknown[]
    }
    return await wrapper(_method, _params)
  }

  doSearch(client)

  return remote
}
