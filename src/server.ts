import { AsyncLocalStorage } from "node:async_hooks"
import { resolve } from "node:path"

import { globStream } from "glob"
import { z } from "zod"

import { shortHash } from "./_shared.js"

export type Options = {
	patterns?: string | string[]
}

export type Proc = (...args: unknown[]) => Promise<unknown>

export class InvalidRequestBodyError extends Error {}
export class UnknownProcedureError extends Error {}
export class ValidationError extends Error {}

export const RequestBodySchema = z.tuple([z.string()]).rest(z.unknown())

export async function createRpc({
	patterns = "src/**/*.server.ts",
}: Options = {}) {
	const procMap = new Map<string, Proc>()

	const paths = globStream(patterns)

	for await (const path of paths) {
		const absolutePath = resolve(process.cwd(), path)

		const module = await import(absolutePath)

		for (const _export in module) {
			const procName = `${path}:${_export}`

			procMap.set(procName, module[_export])
			procMap.set(shortHash(procName), module[_export])
		}
	}

	return (body: unknown) => {
		const bodyResult = RequestBodySchema.safeParse(body)

		if (!bodyResult.success) {
			throw new InvalidRequestBodyError()
		}

		const [procName, ...args] = bodyResult.data

		const proc = procMap.get(procName)

		if (proc == null) {
			throw new UnknownProcedureError()
		}

		return proc(...args)
	}
}

export interface Context {}

const asyncLocalStorage = new AsyncLocalStorage<Context>()

export function createContext(context: Context) {
	if (asyncLocalStorage.getStore() != null) {
		throw new Error("Context has already been created.")
	}

	asyncLocalStorage.enterWith(context)
}

export function useContext() {
	const context = asyncLocalStorage.getStore()

	if (context == null) {
		throw new Error("Context has not been created.")
	}

	return context
}
