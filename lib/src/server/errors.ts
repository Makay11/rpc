export class RpcError extends Error {}

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
	constructor() {
		super("Validation error")
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
