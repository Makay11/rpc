import { err, ok } from "@makay/rpc/result"
import { z, zv } from "@makay/rpc/zod"

import { type User, useUser } from "../server/useUser"

export type Todo = {
	id: string
	text: string
	creator: User
}

const todos: Todo[] = []

const textSchema = z.string().min(1).max(256)

export async function createTodo(text: string) {
	zv(text, textSchema)

	const user = useUser()

	if (user == null) {
		return err("Unauthorized" as const)
	}

	const todo: Todo = {
		id: crypto.randomUUID(),
		text,
		creator: user,
	}

	todos.push(todo)

	return ok(todo)
}

export async function getTodos() {
	const user = useUser()

	if (user == null) {
		return err("Unauthorized" as const)
	}

	return ok(todos)
}
