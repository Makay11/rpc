import type { Context } from "hono"
import { streamSSE } from "hono/streaming"
import type { MiddlewareHandler } from "hono/types"

import { Observable } from "./observable.js"
import {
	createRpc as _createRpc,
	defineState,
	ForbiddenError,
	type Options as RpcOptions,
	RpcError,
	UnauthorizedError,
} from "./server.js"

export type MaybePromise<T> = T | Promise<T>

export type Options = RpcOptions & {
	onRequest?: (ctx: Context) => MaybePromise<void>
	onUnhandledError?: (ctx: Context, error: unknown) => MaybePromise<void>
}

const { createState: createContext, useStateOrThrow: useContext } =
	defineState<Context>()

export { useContext }

export async function createRpc({
	onRequest,
	onUnhandledError,
	...options
}: Options = {}): Promise<MiddlewareHandler> {
	const rpc = await _createRpc(options)

	return async (ctx) => {
		// this forces a new async context to be created before
		// we call `createContext` to avoid context collisions
		await Promise.resolve()

		createContext(ctx)

		if (onRequest != null) {
			await onRequest(ctx)
		}

		const body: unknown = await ctx.req.json()

		try {
			const result = await rpc(body)

			if (result instanceof Observable) {
				return streamSSE(ctx, async (stream) => {
					await stream.writeSSE({
						event: "open",
						data: "",
					})

					const unsubscribe = result.subscribe((event: unknown) => {
						stream
							.writeSSE({
								data: JSON.stringify(event),
							})
							.catch((error: unknown) => {
								console.error(error)
							})
					})

					stream.onAbort(unsubscribe)
				})
			}

			return ctx.json(result)
		} catch (error) {
			if (error instanceof UnauthorizedError) {
				return ctx.text(error.message, 401)
			}

			if (error instanceof ForbiddenError) {
				return ctx.text(error.message, 403)
			}

			if (error instanceof RpcError) {
				return ctx.text(error.message, 400)
			}

			if (onUnhandledError != null) {
				return onUnhandledError(ctx, error)
			}

			throw error
		}
	}
}
