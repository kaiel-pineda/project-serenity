import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			colors: {
				"outer-space": {
					50: "#f4f6f7",
					100: "#e3e8ea",
					200: "#c9d3d8",
					300: "#a4b4bc",
					400: "#778c99",
					500: "#5c717e",
					600: "#4f5f6b",
					700: "#44505a",
					800: "#3d454d",
					900: "#343a40",
					950: "#21262b",
				},
				"old-gold": {
					50: "#fefee5",
					100: "#ffffb8",
					200: "#fffd76",
					300: "#fff328",
					400: "#eed700",
					500: "#ceb202",
					600: "#b48d00",
					700: "#8e6302",
					800: "#754e09",
					900: "#643f0d",
					950: "#3b2203",
				},
				"fuscous-gray": {
					50: "#f6f6f6",
					100: "#e7e7e7",
					200: "#d1d1d1",
					300: "#b0b0b0",
					400: "#888888",
					500: "#6d6d6d",
					600: "#5d5d5d",
					700: "#505050",
					800: "#454545",
					900: "#3d3d3d",
					950: "#262626",
				},
				"brandy-punch": {
					50: "#fcf8ee",
					100: "#f6eacf",
					200: "#ecd49b",
					300: "#e2b967",
					400: "#dba344",
					500: "#cf832c",
					600: "#ba6725",
					700: "#9b4b22",
					800: "#7f3c21",
					900: "#69321e",
					950: "#3b190d",
				},
				"puerto-rico": {
					50: "#f3faf8",
					100: "#d6f1e8",
					200: "#ade2d1",
					300: "#7cccb6",
					400: "#67bba6",
					500: "#37957f",
					600: "#297867",
					700: "#256055",
					800: "#214e45",
					900: "#1f423b",
					950: "#0d2622",
				},
			},
			fontFamily: {
				sans: ["Open Sans Variable", ...defaultTheme.fontFamily.sans],
			},
		},
	},
	plugins: [
		// ...
	],
};
