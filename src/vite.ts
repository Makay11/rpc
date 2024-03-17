import { relative } from "node:path"

import { map } from "itertools"
import {
	FunctionDeclaration,
	InterfaceDeclaration,
	Project,
	TypeAliasDeclaration,
} from "ts-morph"
import { createFilter, type PluginOption } from "vite"

import { shortHash } from "./_shared.js"

export function rpc({
	include = "src/**/*.server.ts",
	exclude,
	hashProcedures = true,
}: {
	include?: string | string[]
	exclude?: string | string[]
	hashProcedures?: boolean
} = {}): PluginOption {
	const filter = createFilter(include, exclude)

	const _import = `import { rpc } from "@/lib/fetch"`

	let projectRoot: string

	return {
		name: "@makay/rpc",

		enforce: "pre",

		configResolved(config) {
			projectRoot = config.root
		},

		async transform(code, id) {
			if (!filter(id)) return

			const path = relative(projectRoot, id)

			const project = new Project({ useInMemoryFileSystem: true })

			const sourceFile = project.createSourceFile(path, code)

			const exportedDeclarations = sourceFile.getExportedDeclarations()

			if (exportedDeclarations.has("default")) {
				throw new Error(`Default exports are not allowed.`)
			}

			const names = new Set<string>()

			for (const [name, declarations] of exportedDeclarations) {
				let isAsyncFunction = false

				for (const declaration of declarations) {
					if (
						declaration instanceof TypeAliasDeclaration ||
						declaration instanceof InterfaceDeclaration
					) {
						break
					}

					if (
						!(
							declaration instanceof FunctionDeclaration &&
							declaration.isAsync()
						)
					) {
						throw new Error(`All exports must be local plain async functions.`)
					}

					isAsyncFunction = true
				}

				if (isAsyncFunction) {
					names.add(name)
				}
			}

			const exports = map(names, (name) => {
				const proc = hashProcedures
					? shortHash(`${path}:${name}`)
					: `${path}:${name}`

				return `export const ${name} = rpc("${proc}")`
			}).join("\n")

			return `${_import}\n${exports}`
		},
	}
}
