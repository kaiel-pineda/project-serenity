import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
            colors: {
                'outer-space': {
                    '50': '#f4f6f7',
                    '100': '#e3e8ea',
                    '200': '#c9d3d8',
                    '300': '#a4b4bc',
                    '400': '#778c99',
                    '500': '#5c717e',
                    '600': '#4f5f6b',
                    '700': '#44505a',
                    '800': '#3d454d',
                    '900': '#343a40',
                    '950': '#21262b',
                },
            },
            fontFamily: {
                sans: ['Open Sans Variable', ...defaultTheme.fontFamily.sans],
            },
        },
	},
	plugins: [
		// ...
	],
};
