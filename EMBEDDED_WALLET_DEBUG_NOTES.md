# Embedded Wallet Debug Notes

## Problem Summary

The embedded wallet (iframe at localhost:9100/keys) is not receiving/processing messages from the parent page. The core issue is that the server code in up-provider is designed for a parent window managing child iframes, but in the embedded wallet case, the iframe itself IS the provider.

## Architecture Difference

### Grid Example (Working)

- Parent page: Server (`createUPProviderConnector`)
- Child iframes: Clients (`createClientUPProvider`)
- Message flow: iframe → parent
- Server searches for iframes in its DOM

### Embedded Wallet (Not Working)

- Parent page: Client (`createClientUPProvider`)
- Iframe (localhost:9100/keys): Server (`createUPProviderConnector`)
- Message flow: parent → iframe
- Server (in iframe) has no child iframes to search

## Root Cause

In `server.ts`, when the server receives `upProvider:hasProvider`:

1. It tries to find which iframe sent the message by comparing `contentWindow`
2. But in embedded wallet, the server IS the iframe - there are no child iframes
3. The message is never matched and goes nowhere

## Solution

The server needs to detect when it's running inside an iframe and handle messages from its parent:

```javascript
// In server.ts providerHandler
if (event.data === 'upProvider:hasProvider') {
  // Check if this is from our parent (we're in an iframe)
  if (event.source === window.parent && window.parent !== window) {
    // We're an iframe receiving from our parent
    // Create a special channel for the parent window
    // Use event.source as the window, null as the element
    const channel = new _UPClientChannel(
      serverChannel,
      event.source as Window,
      null, // no iframe element
      channelId,
      server,
      //... other params
    );
    // Continue with channel setup...
  } else {
    // Original logic - we're a parent looking for child iframes
    // ... existing iframe search code ...
  }
}
```

## Key Points

- `event.source === window.parent` when parent sends to iframe
- No iframe element exists (use null)
- Channel ID generation might need adjustment
- Everything else (MessageChannel, RPC) should work the same

## Files Modified

1. Created `popup-vanilla.ts` to replace shadow DOM implementation
2. Modified `client.ts` to import vanilla popup
3. Added debug mode to keep modal open (`localStorage.setItem('upProvider:debug', 'true')`)
4. Added debug logging to server message handler

## Next Steps

1. Implement the special case in server.ts for iframe-as-provider
2. Test that channel creation works without an iframe element reference
3. Verify RPC communication works after handshake
4. Check that wallet initialization (passkey auth) triggers correctly
