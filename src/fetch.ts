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
