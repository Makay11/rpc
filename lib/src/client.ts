import { EventSourceParserStream } from "eventsource-parser/stream"

import { Observable } from "./observable.js"

declare const __MAKAY_RPC_SSE__: boolean

export type Config = {
	url: string
	credentials: RequestCredentials
}

export const config: Config = {
	url: "/rpc",
	credentials: "same-origin",
}

export class RpcClientError extends Error {
	response: Response

	constructor(response: Response) {
		super(response.statusText)

		this.response = response
	}
}

export function rpc(proc: string) {
	return async (...args: unknown[]) => {
		const response = await fetch(config.url, {
			method: "POST",
			credentials: config.credentials,
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify([proc, ...args]),
		})

		if (!response.ok) {
			throw new RpcClientError(response)
		}

		if (response.headers.get("Content-Type") === "text/event-stream") {
			if (!__MAKAY_RPC_SSE__) {
				throw new Error("SSE support is not enabled.")
			}

			return new Observable((emit) => {
				const abortController = new AbortController()

				response
					.body!.pipeThrough(new TextDecoderStream())
					.pipeThrough(new EventSourceParserStream())
					.pipeTo(
						new WritableStream({
							write({ event, data }) {
								if (event === "open") return

								emit(JSON.parse(data))
							},
						}),
						{ signal: abortController.signal },
					)
					.catch((error: unknown) => {
						if (error instanceof DOMException && error.name === "AbortError")
							return

						console.error(error)
					})

				function abort() {
					abortController.abort()
				}

				window.addEventListener("beforeunload", abort)

				return () => {
					abortController.abort()
					window.removeEventListener("beforeunload", abort)
				}
			})
		}

		return response.json()
	}
}
