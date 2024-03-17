module.exports = {
	root: true,

	plugins: ["@typescript-eslint", "simple-import-sort"],

	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],

	parser: "@typescript-eslint/parser",

	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},

	env: {
		browser: true,
		es2021: true,
		node: true,
	},

	overrides: [
		{
			files: [".eslintrc.{js,cjs}"],
			env: {
				node: true,
			},
			parserOptions: {
				sourceType: "script",
			},
		},
	],

	reportUnusedDisableDirectives: true,

	rules: {
		// ESLint rules
		eqeqeq: ["error", "smart"],
		// "no-undef": "error",
		"no-useless-concat": "warn",
		"object-shorthand": "warn",
		"prefer-destructuring": ["warn", { array: false, object: true }],
		"prefer-template": "warn",
		"require-await": "warn",
		"spaced-comment": ["warn", "always", { markers: ["/"] }],

		// Simple import sort rules
		"simple-import-sort/imports": "warn",
		"simple-import-sort/exports": "warn",

		// Typescript rules
		"@typescript-eslint/no-non-null-assertion": "off",
	},
}
