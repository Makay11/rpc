export type Result<Value, Error> = Ok<Value> | Err<Error>

export type Ok<Value> = {
	ok: true
	value: Value
}

export type Err<Error> = {
	ok: false
	error: Error
}

export type AsyncResult<Value, Error> = Promise<Ok<Value> | Err<Error>>

export type AsyncOk<Value> = Promise<Ok<Value>>

export type AsyncErr<Error> = Promise<Err<Error>>

export function ok<Value>(value: Value): Ok<Value> {
	return {
		ok: true,
		value,
	}
}

export const okConst = <const Value>(value: Value) => ok(value)

export function err<Error>(error: Error): Err<Error> {
	return {
		ok: false,
		error,
	}
}

export const errConst = <const Error>(error: Error) => err(error)
