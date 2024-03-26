import { EventSourceParserStream } from "eventsource-parser/stream"

export type Config = {
	url: string
	credentials: RequestCredentials
}

export const config: Config = {
	url: "/rpc",
	credentials: "same-origin",
}

export function rpc(proc: string) {
	return async (...args: unknown[]) => {
		const res = await fetch(config.url, {
			method: "POST",
			credentials: config.credentials,
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify([proc, ...args]),
		})

		return res.json()
	}
}

export type OnEvent = (event: unknown) => void

export function sse(proc: string) {
	return async (onEvent: OnEvent, ...args: unknown[]) => {
		const res = await fetch(config.url, {
			method: "POST",
			credentials: config.credentials,
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify([proc, ...args]),
		})

		const reader = res
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
	}
}
