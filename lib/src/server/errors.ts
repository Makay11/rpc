import { JSONValue } from "hono/utils/types"

export class RpcError extends Error {
	toJSON(): JSONValue {
		return this.message
	}
}

export class InvalidRequestBodyError extends RpcError {
	constructor() {
		super("Invalid request body")
	}
}

export class UnknownProcedureError extends RpcError {
	constructor() {
		super("Unknown procedure")
	}
}

export class ValidationError extends RpcError {
	error: JSONValue

	constructor(error?: JSONValue) {
		super("Validation error")

		this.error = error
	}

	override toJSON() {
		return this.error ?? super.toJSON()
	}
}

export class UnauthorizedError extends RpcError {
	constructor() {
		super("Unauthorized")
	}
}

export class ForbiddenError extends RpcError {
	constructor() {
		super("Forbidden")
	}
}
