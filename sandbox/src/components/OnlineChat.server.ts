import { UnauthorizedError } from "@makay/rpc/server"
import { z, zv } from "@makay/rpc/zod"

import {
	login as _login,
	logout as _logout,
	UserSchema,
	useUser,
} from "../server/auth"

export async function getUser() {
	return useUser()
}

const UsernameSchema = UserSchema.shape.username

export async function login(username: string) {
	zv(username, UsernameSchema)

	return _login(username)
}

export async function logout() {
	_logout()

	return true
}

export type Message = {
	id: string
	text: string
	senderId: string
}

const messages: Message[] = []

export async function getMessages() {
	const user = await getUser()

	if (user == null) {
		throw new UnauthorizedError()
	}

	return messages
}

const MessageTextSchema = z.string().min(1).max(256)

export async function createMessage(text: string) {
	zv(text, MessageTextSchema)

	const user = await getUser()

	if (user == null) {
		throw new UnauthorizedError()
	}

	const message: Message = {
		id: crypto.randomUUID(),
		text,
		senderId: user.id,
	}

	messages.push(message)

	return message
}
