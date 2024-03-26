import { resolve } from "node:path"

import { globStream } from "glob"
import { z } from "zod"

import { shortHash } from "./_shared.js"
import {
	InvalidRequestBodyError,
	UnknownProcedureError,
} from "./server/errors.js"

export * from "./server/errors.js"
export * from "./server/state.js"

export type Options = {
	patterns?: string | string[]
}

export type Procedure = BasicProcedure | SseProcedure

export type BasicProcedure = (...args: unknown[]) => Promise<unknown>

export type SseProcedure = (
	...args: unknown[]
) => (emit: Emit<unknown>) => Promise<unknown>

export type Emit<Event> = (event: Event) => void

export const RequestBodySchema = z.tuple([z.string()]).rest(z.unknown())

export async function createRpc({
	patterns = "src/**/*.server.ts",
}: Options = {}) {
	const proceduresMap = new Map<string, Procedure>()

	for await (const path of globStream(patterns)) {
		const absolutePath = resolve(process.cwd(), path)

		const module = (await import(absolutePath)) as Record<
			string,
			BasicProcedure
		>

		for (const _export in module) {
			const procedureId = `${path}:${_export}`
			let procedure: Procedure = module[_export]!

			if (procedureId.endsWith("Events")) {
				procedure = sse(procedure)
			}

			proceduresMap.set(procedureId, procedure)
			proceduresMap.set(shortHash(procedureId), procedure)
		}
	}

	return (body: unknown) => {
		const bodyResult = RequestBodySchema.safeParse(body)

		if (!bodyResult.success) {
			throw new InvalidRequestBodyError()
		}

		const [procedureId, ...args] = bodyResult.data

		const procedure = proceduresMap.get(procedureId)

		if (procedure == null) {
			throw new UnknownProcedureError()
		}

		return procedure(...args)
	}
}

function sse(procedure: BasicProcedure): SseProcedure {
	return (...args: unknown[]) =>
		(emit) =>
			procedure(emit, ...args)
}
