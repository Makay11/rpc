import { useContext } from "@makay/rpc/hono"
import { defineState, UnauthorizedError } from "@makay/rpc/server"
import { z } from "@makay/rpc/zod"
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie"

export const UserSchema = z.object({
	id: z.string().uuid(),
	username: z.string().min(1).max(32),
})

export type User = z.output<typeof UserSchema>

const {
	createState: createUser,
	clearState: clearUser,
	useState: _useUser,
} = defineState<User>()

// not a real secret
const SECRET: string = "43c79fc7-348c-4617-99ca-6167c01e8313"

export async function login(username: string) {
	const ctx = useContext()

	const user: User = {
		id: crypto.randomUUID(),
		username,
	}

	await setSignedCookie(ctx, "user", JSON.stringify(user), SECRET, {
		httpOnly: true,
		sameSite: "Strict",
	})

	return createUser(user)
}

export function logout() {
	const ctx = useContext()

	deleteCookie(ctx, "user")

	clearUser()
}

export async function useUser() {
	const user = _useUser()

	if (user != null) {
		return user
	}

	const ctx = useContext()

	const cookie = await getSignedCookie(ctx, SECRET, "user")

	if (!cookie) {
		return null
	}

	try {
		const user = UserSchema.parse(JSON.parse(cookie))

		return createUser(user)
	} catch {
		return null
	}
}

export async function useUserOrThrow() {
	const user = await useUser()

	if (user == null) {
		throw new UnauthorizedError()
	}

	return user
}
