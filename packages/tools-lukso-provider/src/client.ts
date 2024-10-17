import { JSONRPCClient } from 'json-rpc-2.0'
import { v4 as uuidv4 } from 'uuid'

type Item = {
  resolve: () => unknown
  reject: (reason: unknown) => unknown
  sent: boolean
  id: number | string
  method: string
  params: unknown[]
}
const pendingRequests = new Map<string, Item>()

type RemoteWallet = {
  window: Window
  remote: MessagePort
  local: MessagePort
}

let walletWindow: RemoteWallet | null = null

async function testWindow(
  _up: Window | undefined | null
): Promise<RemoteWallet> {
  const up = _up || (typeof window !== 'undefined' ? window : undefined)
  if (!up) {
    throw new Error('No UP found')
  }
  return new Promise<RemoteWallet>((resolve, reject) => {
    let timeout: number | NodeJS.Timeout = 0
    const channel = new MessageChannel()
    const testFn = (event: MessageEvent) => {
      if (event.data === 'upProvider:windowInitialized') {
        console.log('client init', event.data, up)
        up.removeEventListener('message', testFn)
        if (timeout) {
          clearTimeout(timeout)
          timeout = 0
        }
        resolve({ window: up, remote: event.ports[0], local: channel.port1 })
      }
    }
    channel.port1.addEventListener('message', testFn)
    channel.port1.start()
    window.addEventListener('message', testFn)
    console.log('client', 'send find wallet', up.location.href, up)
    up.postMessage('upProvider:hasProvider', '*', [channel.port2])

    timeout = setTimeout(() => {
      timeout = 0
      window.removeEventListener('message', testFn)
      channel.port1.removeEventListener('message', testFn)

      console.log('client', 'No UP found', up.location.href, up)
      reject(new Error('No UP found'))
    }, 1000)
  })
}

async function findUP(authURL: string | Window | undefined | null) {
  let current = walletWindow || window.opener || window.parent
  if (current) {
    const up = await testWindow(current)
    if (up) {
      walletWindow = up
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
    const up = await testWindow(current)
    if (walletWindow) {
      walletWindow = up
      return up
    }
  }
  throw new Error('No UP found')
}

async function findDestination(
  authURL: string | Window | undefined | null,
  search = false
): Promise<RemoteWallet> {
  let up: RemoteWallet | undefined =
    (typeof authURL === 'object' && authURL instanceof Window) ||
    authURL == null
      ? await testWindow(authURL).catch(error => {
          if (search) {
            return undefined
          }
          throw error
        })
      : await findUP(authURL)
  if (search && !up) {
    let retry = 3
    while (retry > 0) {
      let current: Window | undefined =
        window.opener && window.opener !== window
          ? window.opener
          : window.parent && window.parent !== window
            ? window.parent
            : undefined
      console.log('search', current?.location.href)
      while (current) {
        up = await testWindow(current).catch(() => undefined)
        if (up) {
          break
        }
        if (current === window.top) {
          break
        }
        console.log('current', current.location.href)
        current =
          current.opener && current.opener !== current
            ? current.opener
            : current.parent && current.parent !== current
              ? current.parent
              : null
        console.log('next', current?.location.href)
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

export function createClientUPProvider(
  authURL?: string | Window,
  search = true
) {
  let chainId = 0
  let accounts: string[] = []
  let rpcUrls: string[] = []
  const doSearch = findDestination(authURL, search).then(up => {
    up.local?.addEventListener('message', event => {
      try {
        const response = event.data
        console.log('client', response)
        switch (response.method) {
          case 'chainChanged':
            chainId = response.params[0]
            return
          case 'accountsChanged':
            accounts = response.params
            return
          case 'rpcUrlsChanged':
            rpcUrls = response.params
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
            console.error('error', { error, method, params, id, jsonrpc })
            client.receive({ ...response, id: item.id })
            reject(error) // Reject in case of error
          }
          pendingRequests.delete(response.id) // Clean up the request
        }
      } catch (error) {
        console.error('Error parsing JSON RPC response', error, event)
      }
    })
    up.local?.start()

    return up
  })
  const client = new JSONRPCClient(async (jsonRPCRequest: any) => {
    const up = await doSearch
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
      up.remote.postMessage(jsonRPCRequest)
    })
  })
  const oldRequest = client.request.bind(client)
  const wrapper = async (method: string, params: unknown[]) => {
    switch (method) {
      case 'eth_call':
        if (rpcUrls.length > 0) {
          console.log('client direct rpc', rpcUrls, method, params)
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
              console.error('error', error)
              errors.push(error)
            }
          }
          const err: any = new Error(
            `All RPC URLs failed: ${errors.map(e => (e as { message: string }).message).join(', ')}`
          )
          err.errors = errors
          throw err
        }
    }
    if (/^(eth_chainId|eth_accounts|eth_call)$/.test(method)) {
    }
    return oldRequest(method, params)
  }
  client.request = async (method, params) => {
    await doSearch
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
  return Object.freeze({
    request: client.request.bind(client),
    get chainId() {
      return chainId
    },
    get accounts() {
      return accounts
    },
  })
}
