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

[packages/tools-lukso-provider/src/server.ts:462](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L462)
