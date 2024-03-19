import { fileURLToPath, URL } from "node:url"

import { rpc } from "@makay/rpc/vite"
import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"
import Inspect from "vite-plugin-inspect"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue(), rpc(), Inspect()],

	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},

	server: {
		port: 5173,
		strictPort: true,
	},

	preview: {
		port: 5173,
		strictPort: true,
	},
})
