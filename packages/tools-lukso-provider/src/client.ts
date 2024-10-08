import { JSONRPCClient } from 'json-rpc-2.0'

type Item = {
  resolve: () => unknown
  reject: (reason: unknown) => unknown
  sent: boolean
  id: number | string
}
const pendingRequests = new Map<string, Item>()
let _channel = 1
let walletWindow: Window | null = null

export const WALLET_TARGET_KEY = 'universalprofile-embedded'
export const WALLET_RESPONSE_KEY = 'universalprofile-embedded-response'

async function testWindow(_up?: Window) {
  const up = _up || typeof window !== 'undefined' ? window : undefined
  if (!up) {
    throw new Error('No UP found')
  }
  return new Promise<Window>((resolve, reject) => {
    const testFn = (event: MessageEvent) => {
      if (
        typeof event.data === 'object' &&
        event.data.target === WALLET_RESPONSE_KEY
      ) {
        const msg = JSON.parse(event.data.data)
        console.log('client', msg)
        up.removeEventListener('message', testFn)
        if (msg.success) {
          resolve(up)
        }
      }
    }

    up.addEventListener('message', testFn)
    console.log('client', 'find wallet')
    up.postMessage(
      {
        target: WALLET_TARGET_KEY,
        data: JSON.stringify({ type: 'universalprofile', is: true }),
      },
      '*'
    )

    setTimeout(() => {
      up.removeEventListener('message', testFn)
      reject(new Error('No UP found'))
    }, 1000)
  })
}

async function findUP(authURL?: string) {
  let current = walletWindow || window.opener || window.parent
  if (current) {
    const up = await testWindow(current)
    if (up) {
      walletWindow = up
      return up
    }
  }
  if (!authURL) {
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

export function createClient(authURL?: string | Window) {
  const client = new JSONRPCClient(async (jsonRPCRequest: any) => {
    const channel = walletWindow ? _channel : _channel++
    const up =
      (typeof authURL === 'object' && authURL instanceof Window) ||
      authURL == null
        ? await testWindow(authURL)
        : await findUP(authURL)
    return new Promise((resolve, reject) => {
      const requestId = `${channel}:${jsonRPCRequest.id}`
      pendingRequests.set(requestId, {
        resolve,
        reject,
        sent: false,
        id: jsonRPCRequest.id,
      })
      up.postMessage(
        {
          target: WALLET_TARGET_KEY,
          data: JSON.stringify({
            ...jsonRPCRequest,
            id: requestId,
          }),
        },
        '*'
      )
    })
  })

  window.addEventListener('message', event => {
    try {
      if (
        typeof event.data === 'object' &&
        event.data.target === WALLET_RESPONSE_KEY
      ) {
        const response = JSON.parse(event.data.data)
        if (response.type === 'universalprofile') {
          return
        }
        console.log('client', response)
        const item = pendingRequests.get(response.id)
        if (response.id && item) {
          const { resolve, reject } = item
          if (response.result) {
            client.receive({ ...response, id: item.id }) // Handle the response
            resolve() // Resolve the corresponding promise
          } else if (response.error) {
            client.receive({ ...response, id: item.id })
            reject(response.error) // Reject in case of error
          }
          pendingRequests.delete(response.id) // Clean up the request
        }
      }
    } catch (error) {
      console.error('Error parsing JSON RPC response', error, event)
    }
  })
  return client
}
