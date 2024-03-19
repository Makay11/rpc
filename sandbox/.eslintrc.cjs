/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution")

module.exports = {
	root: true,

	plugins: ["simple-import-sort"],

	extends: [
		"eslint:recommended",
		"plugin:vue/vue3-recommended",
		"@vue/eslint-config-typescript/recommended",
		"prettier",
	],

	reportUnusedDisableDirectives: true,

	rules: {
		// ESLint rules
		eqeqeq: ["error", "smart"],
		"no-useless-concat": "warn",
		"object-shorthand": "warn",
		"prefer-destructuring": ["warn", { array: false, object: true }],
		"prefer-template": "warn",
		"spaced-comment": ["warn", "always", { markers: ["/"] }],

		// Simple import sort rules
		"simple-import-sort/imports": "warn",
		"simple-import-sort/exports": "warn",

		// Typescript rules
		"@typescript-eslint/no-non-null-assertion": "off",
	},
}
