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

[packages/tools-lukso-provider/src/server.ts:431](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L431)
