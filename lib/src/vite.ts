import { relative } from "node:path"

import { map } from "itertools"
import {
	createFilter,
	parseAstAsync,
	type PluginOption,
	ResolvedConfig,
} from "vite"

import { shortHash } from "./_shared.js"

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

	const _import = `import { rpc } from "@makay/rpc/fetch"`

	let config: ResolvedConfig

	return {
		name: "@makay/rpc",

		configResolved(_config) {
			config = _config
		},

		async transform(code, id) {
			if (!filter(id)) return

			const program = await parseAstAsync(code)

			const names = new Set<string>()

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

					names.add(node.declaration.id.name)
				}
			}

			if (names.size === 0) {
				return "export {}"
			}

			const path = relative(config.root, id)

			const createExport =
				hashProcedures ?? config.mode === "production"
					? (name: string) =>
							`export const ${name} = rpc("${shortHash(`${path}:${name}`)}")`
					: (name: string) => `export const ${name} = rpc("${path}:${name}")`

			const exports = map(names, createExport).join("\n")

			return `${_import}\n${exports}`
		},
	}
}
