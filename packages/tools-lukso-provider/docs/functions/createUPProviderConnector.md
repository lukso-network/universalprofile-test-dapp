[**@lukso/embedded-provider**](../README.md) • **Docs**

***

[@lukso/embedded-provider](../globals.md) / createUPProviderConnector

# Function: createUPProviderConnector()

> **createUPProviderConnector**(`provider`?, `rpcUrls`?): [`UPProviderConnector`](../interfaces/UPProviderConnector.md)

Install a global UPProvider inside of the particular window which will listen for client
connections and establish them. It will fire `up-channel-connected` on the particular iframe if it's reachable.
It will fire a local `channelCreated` event as well.

## Parameters

• **provider?**: `any`

the initial provider to proxy

• **rpcUrls?**: `string` \| `string`[]

rpc urls to give to the clients to locally connect for non eth_sendTransaction and so on.

## Returns

[`UPProviderConnector`](../interfaces/UPProviderConnector.md)

The global provider and event sing for `channelCreated` events.

## Defined in

[packages/tools-lukso-provider/src/server.ts:450](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L450)
