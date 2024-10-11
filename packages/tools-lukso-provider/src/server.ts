import { JSONRPCServer } from 'json-rpc-2.0'
import { v4 as uuidv4 } from 'uuid'

export function createServer() {
  const server = new JSONRPCServer()

  // Define your server-side methods
  server.addMethod('exampleMethod', params => {
    return `Hello, ${params.name}!`
  })

  console.log('server listen', window.location.href, window)
  window.addEventListener('message', event => {
    if (event.data === 'upProvider:hasProvider') {
      const channel = new MessageChannel()
      const channelId = uuidv4()
      console.log('server hasProvider', event.data, event.ports)
      // Listen for messages from the client
      const ports = event.ports
      channel.port1.addEventListener('message', (event: MessageEvent) => {
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
              ports[0]?.postMessage({
                ...response,
                id: JSON.parse(response.id.replace(`${channelId}:`, '')),
              })
            }
          })
        } catch (error) {
          console.error('Error parsing JSON RPC request', error, event)
        }
      })
      channel.port1.start()

      console.log('server accept', channel.port2)
      event.source?.postMessage('upProvider:windowInitialized', {
        transfer: [channel.port2],
      })
    }
  })
  return server
}
