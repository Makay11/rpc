import type { Context as HonoContext } from "hono"
import type { MiddlewareHandler } from "hono/types"

import {
	InvalidRequestBodyError,
	UnknownProcedureError,
	ValidationError,
	createContext as _createContext,
	createRpc as _createRpc,
	type Context,
	type Options as RpcOptions,
} from "./server.js"

export type MaybePromise<T> = T | Promise<T>

export type Options = RpcOptions & {
	createContext?: (c: HonoContext) => MaybePromise<Context>
}

export async function createRpc({
	createContext,
	...options
}: Options = {}): Promise<MiddlewareHandler> {
	const rpc = await _createRpc(options)

	return async (c) => {
		if (createContext != null) {
			_createContext(await createContext(c))
		}

		const body = await c.req.json()

		try {
			return c.json(await rpc(body))
		} catch (error) {
			if (error instanceof InvalidRequestBodyError) {
				return c.text("Invalid request body.", 400)
			}

			if (error instanceof UnknownProcedureError) {
				return c.text("Unknown procedure.", 400)
			}

			if (error instanceof ValidationError) {
				return c.text("Validation error.", 400)
			}

			throw error
		}
	}
}
