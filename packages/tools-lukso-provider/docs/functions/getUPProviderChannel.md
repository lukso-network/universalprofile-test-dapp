[**@lukso/embedded-provider**](../README.md) • **Docs**

***

[@lukso/embedded-provider](../globals.md) / getUPProviderChannel

# Function: getUPProviderChannel()

> **getUPProviderChannel**(`id`): [`UPClientChannel`](../interfaces/UPClientChannel.md) \| `null`

Global method to find channel in case `up-channel-connected` event was missed.

## Parameters

• **id**: `null` \| `string` \| `Window` \| [`UPClientChannel`](../interfaces/UPClientChannel.md) \| `HTMLIFrameElement`

how to find the UPClientChannel instance (this can be the id, frame (not the frame's element id) or window)

## Returns

[`UPClientChannel`](../interfaces/UPClientChannel.md) \| `null`

UPClientChannel

## Defined in

[packages/tools-lukso-provider/src/server.ts:443](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L443)
