import { EventSourceParserStream } from "eventsource-parser/stream"

export type Config = {
	url: string
	credentials: RequestCredentials
}

export const config: Config = {
	url: "/rpc",
	credentials: "same-origin",
}

function _fetch(proc: string, args: unknown[]) {
	return fetch(config.url, {
		method: "POST",
		credentials: config.credentials,
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify([proc, ...args]),
	})
}

export function rpc(proc: string) {
	return async (...args: unknown[]) => (await _fetch(proc, args)).json()
}

export type EventListener = (event: unknown) => void

export function sse(proc: string) {
	return async (eventListener: EventListener, ...args: unknown[]) => {
		const response = await _fetch(proc, args)

		const abortController = new AbortController()

		response
			.body!.pipeThrough(new TextDecoderStream())
			.pipeThrough(new EventSourceParserStream())
			.pipeTo(
				new WritableStream({
					write: eventListener,
				}),
				{
					signal: abortController.signal,
				},
			)
			.catch((error: unknown) => {
				if (error instanceof DOMException && error.name === "AbortError") {
					return
				}
				console.error(error)
			})

		return () => {
			abortController.abort()
		}
	}
}
