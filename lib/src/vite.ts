import { relative } from "node:path"

import {
	createFilter,
	parseAstAsync,
	type PluginOption,
	ResolvedConfig,
} from "vite"

import { shortHash } from "./_shared.js"

export type Options = {
	include?: string | string[]
	exclude?: string | string[]
	hashProcedures?: boolean
	sse?: boolean
}

export function rpc({
	include = "src/**/*.server.{js,ts}",
	exclude,
	hashProcedures,
	sse = false,
}: Options = {}): PluginOption {
	const filter = createFilter(include, exclude)

	let config: ResolvedConfig

	const _import = 'import { rpc } from "@makay/rpc/client"'

	let createExport: (path: string, name: string) => string

	return {
		name: "@makay/rpc",

		config(config) {
			if (config.define == null) {
				config.define = {
					__MAKAY_RPC_SSE__: sse,
				}
			} else {
				config.define["__MAKAY_RPC_SSE__"] = sse
			}
		},

		configResolved(_config) {
			config = _config

			createExport =
				hashProcedures ?? config.mode === "production"
					? (path, name) =>
							`export const ${name} = rpc("${shortHash(`${path}:${name}`)}")`
					: (path, name) => `export const ${name} = rpc("${path}:${name}")`
		},

		async transform(code, id) {
			if (!filter(id)) return

			const program = await parseAstAsync(code)

			const procedures = new Set<string>()

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

					procedures.add(node.declaration.id.name)
				}
			}

			if (procedures.size === 0) {
				return "export {}"
			}

			const exports: string[] = []

			const path = relative(config.root, id)

			for (const procedure of procedures) {
				exports.push(createExport(path, procedure))
			}

			return `${_import}\n${exports.join("\n")}\n`
		},
	}
}
