/** @type {import("prettier").Config} */
const config = {
	printWidth: 480,
	tabWidth: 4,
	singleQuote: true,
	jsxSingleQuote: true,
	bracketSameLine: true,
	importOrder: ["^@core/(.*)$", "^@server/(.*)$", "^@ui/(.*)$", "^[./]"],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
	plugins: ["prettier-plugin-astro", "prettier-plugin-svelte", "prettier-plugin-tailwindcss", "@trivago/prettier-plugin-sort-imports"],
	overrides: [
		{
			files: "*.astro",
			options: {
				parser: "astro",
			},
		},
		{
			files: "*.svelte",
			options: {
				parser: "svelte",
			},
		},
	],
};

export default config;
