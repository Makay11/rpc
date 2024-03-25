import { relative } from "node:path"

import {
	createFilter,
	parseAstAsync,
	type PluginOption,
	ResolvedConfig,
} from "vite"

import { shortHash } from "./_shared.js"

export type FunctionType = "rpc" | "sse"

export function rpc({
	include = "src/**/*.server.ts",
	exclude,
	hashProcedures,
}: {
	include?: string | string[]
	exclude?: string | string[]
	hashProcedures?: boolean
} = {}): PluginOption {
	const filter = createFilter(include, exclude)

	let config: ResolvedConfig

	const createImport = (types: FunctionType[]) =>
		`import { ${types.join(", ")} } from "@makay/rpc/client"`

	let createExport: (type: FunctionType, path: string, name: string) => string

	return {
		name: "@makay/rpc",

		configResolved(_config) {
			config = _config

			createExport =
				hashProcedures ?? config.mode === "production"
					? (type, path, name) =>
							`export const ${name} = ${type}("${shortHash(`${path}:${name}`)}")`
					: (type, path, name) =>
							`export const ${name} = ${type}("${path}:${name}")`
		},

		async transform(code, id) {
			if (!filter(id)) return

			const program = await parseAstAsync(code)

			const procedures = new Set<string>()
			const subscriptions = new Set<string>()

			for (const node of program.body) {
				if (node.type === "ExportDefaultDeclaration") {
					throw new Error(`Default exports are not allowed.`)
				}

				if (node.type === "ExportAllDeclaration") {
					throw new Error(`All exports must be local plain async functions.`)
				}

				if (node.type === "ExportNamedDeclaration") {
					if (
						node.declaration?.type !== "FunctionDeclaration" ||
						node.declaration.async !== true
					) {
						throw new Error(`All exports must be local plain async functions.`)
					}

					const identifier = node.declaration.id.name

					if (identifier.endsWith("Events")) {
						subscriptions.add(identifier)
					} else {
						procedures.add(identifier)
					}
				}
			}

			if (procedures.size === 0 && subscriptions.size === 0) {
				return "export {}"
			}

			const functionTypes: FunctionType[] = []

			if (procedures.size > 0) {
				functionTypes.push("rpc")
			}

			if (subscriptions.size > 0) {
				functionTypes.push("sse")
			}

			const _import = createImport(functionTypes)

			const exports: string[] = []

			const path = relative(config.root, id)

			for (const procedure of procedures) {
				exports.push(createExport("rpc", path, procedure))
			}

			for (const subscription of subscriptions) {
				exports.push(createExport("sse", path, subscription))
			}

			return `${_import}\n${exports.join("\n")}\n`
		},
	}
}
