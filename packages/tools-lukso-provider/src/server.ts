import { JSONRPCServer } from 'json-rpc-2.0'
import { v4 as uuidv4 } from 'uuid'

const channels = new Map<string, ChannelEntry>()
export class ChannelEntry {
  constructor(
    public channel: MessageChannel,
    public window: Window,
    public element: HTMLIFrameElement | null,
    public id: string
  ) {
    channels.set(id, this)
  }
}

export function findChannel(id: string | Window | HTMLIFrameElement) {
  if (typeof id === 'string') {
    return channels.get(id)
  }
  for (const item of channels.values()) {
    if (item.window === id || item.element === id) {
      return item
    }
  }
  return null
}
export function createServer() {
  const server = new JSONRPCServer()

  // Define your server-side methods
  server.addMethod('exampleMethod', params => {
    return `Hello, ${params.name}!`
  })

  console.log('server listen', window.location.href, window)
  window.addEventListener('message', event => {
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
        ? findChannel(iframe)
        : findChannel(event.source as Window)
      let channelId: string
      let channel: MessageChannel
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
              ports[0]?.postMessage({
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
        channel = previous.channel = new MessageChannel()
      } else {
        channelId = uuidv4()
        channel = new MessageChannel()
        new ChannelEntry(channel, event.source as Window, iframe, channelId)
      }
      console.log('server hasProvider', event.data, event.ports)
      // Listen for messages from the client
      const ports = event.ports
      channel.port1.addEventListener('message', channelHandler)
      channel.port1.start()

      console.log('server accept', channel.port2)
      event.source?.postMessage('upProvider:windowInitialized', {
        transfer: [channel.port2],
      })
    }
  })
  return server
}
