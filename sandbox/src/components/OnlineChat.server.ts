import { zv } from "@makay/rpc/zod"

import { login as _login, UserSchema, useUser } from "../server/auth"

export async function getUser() {
	return useUser()
}

const UsernameSchema = UserSchema.shape.username

export async function login(username: string) {
	zv(username, UsernameSchema)

	return _login(username)
}
