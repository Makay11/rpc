import { config } from "./config.js"

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
