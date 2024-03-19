import { useContext } from "@makay/rpc/hono"
import { defineState } from "@makay/rpc/server"

export type User = {
	name: string
	email: string
	userAgent: string | undefined
}

const { createState, useState } = defineState<User>()

export function useUser() {
	const user = useState()

	if (user != null) {
		return user
	}

	const ctx = useContext()

	if (!ctx.req.header("Authorization")) {
		return null
	}

	return createState({
		name: "Diogo",
		email: "diogo@diogo",
		userAgent: ctx.req.header("User-Agent"),
	})
}
