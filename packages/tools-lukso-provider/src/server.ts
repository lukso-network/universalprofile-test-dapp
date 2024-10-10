import { JSONRPCServer } from 'json-rpc-2.0'
import { WALLET_RESPONSE_KEY, WALLET_TARGET_KEY } from './client'

export function createServer() {
  const server = new JSONRPCServer()

  // Define your server-side methods
  server.addMethod('exampleMethod', params => {
    return `Hello, ${params.name}!`
  })

  // Listen for messages from the client
  window.addEventListener('message', (event: MessageEvent) => {
    try {
      if (
        typeof event.data === 'object' &&
        event.data.target === WALLET_TARGET_KEY
      ) {
        const jsonRPCRequest = JSON.parse(event.data.data)
        console.log('server', jsonRPCRequest)
        if (jsonRPCRequest?.type === 'universalprofile' && jsonRPCRequest.is) {
          console.log('server', 'respond true')
          event.source?.postMessage(
            {
              target: WALLET_RESPONSE_KEY,
              data: JSON.stringify({ type: 'universalprofile', success: true }),
            },
            { targetOrigin: event.origin }
          )
          return
        }

        server.receive(jsonRPCRequest).then(response => {
          if (response) {
            event.source?.postMessage(
              { target: WALLET_RESPONSE_KEY, data: JSON.stringify(response) },
              {
                targetOrigin: event.origin,
              }
            )
          }
        })
      }
    } catch (error) {
      console.error('Error parsing JSON RPC request', error, event)
    }
  })

  return server
}
