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

export type OnEvent = (event: unknown) => void

export function sse(proc: string) {
	return (onEvent: OnEvent, ...args: unknown[]) => {
		const promise = _fetch(proc, args)

		promise.then(async (response) => {
			try {
				const reader = response
					.body!.pipeThrough(new TextDecoderStream())
					.pipeThrough(new EventSourceParserStream())
					.getReader()

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
				while (true) {
					const event = await reader.read()

					if (event.done) {
						break
					}

					onEvent(event.value.data)
				}
			} catch (error) {
				console.error(error)
			}
		}, console.error)

		return promise
	}
}
