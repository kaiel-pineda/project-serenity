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
				copper: {
					50: "#fbf7ef",
					100: "#f2e9d3",
					200: "#e5d0a2",
					300: "#d7b472",
					400: "#ce9e51",
					500: "#bb7d39",
					600: "#ad6732",
					700: "#904e2d",
					800: "#763f2a",
					900: "#623525",
					950: "#371a11",
				},
				acapulco: {
					50: "#f4f9f7",
					100: "#daede6",
					200: "#b4dbce",
					300: "#87c1b0",
					400: "#6aaa99",
					500: "#448877",
					600: "#356c5f",
					700: "#2d584f",
					800: "#284741",
					900: "#243d38",
					950: "#112220",
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
