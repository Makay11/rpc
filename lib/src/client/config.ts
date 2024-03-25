export type Config = {
	url: string
	credentials: RequestCredentials
}

export const config: Config = {
	url: "/rpc",
	credentials: "same-origin",
}
