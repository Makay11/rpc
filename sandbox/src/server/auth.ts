import { useContext } from "@makay/rpc/hono"
import { defineState } from "@makay/rpc/server"
import { z } from "@makay/rpc/zod"
import { deleteCookie, getCookie, setCookie } from "hono/cookie"

const UserSchema = z.object({
	id: z.string().uuid(),
	username: z.string().min(1).max(32),
})

export type User = z.output<typeof UserSchema>

const {
	createState: createUser,
	clearState: clearUser,
	useState: _useUser,
} = defineState<User>()

export function login(username: string) {
	const ctx = useContext()

	const user: User = {
		id: crypto.randomUUID(),
		username,
	}

	setCookie(ctx, "user", JSON.stringify(user), {
		httpOnly: true,
	})

	createUser(user)
}

export function logout() {
	const ctx = useContext()

	deleteCookie(ctx, "user")

	clearUser()
}

export function useUser() {
	const user = _useUser()

	if (user != null) {
		return user
	}

	const ctx = useContext()

	const cookie = getCookie(ctx, "user")

	if (cookie == null) {
		return null
	}

	try {
		const user = UserSchema.parse(JSON.parse(cookie))

		return createUser(user)
	} catch {
		return null
	}
}
