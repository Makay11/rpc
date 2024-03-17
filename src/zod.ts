import { z } from "zod"

import { ValidationError } from "./server.js"

export * from "zod"

export function zv<Schema extends z.ZodTypeAny>(
	arg: unknown,
	schema: Schema
): asserts arg is z.infer<Schema> {
	const result = schema.safeParse(arg)

	if (!result.success) {
		throw new ValidationError()
	}
}
