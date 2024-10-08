import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
		"./app/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
			},
			fontFamily: {
				poppins: ["Poppins", "sans-serif"],
			},
			fontWeight: {
				thin: "100",
				extralight: "200",
				light: "300",
				medium: "500",
				semibold: "600",
				extrabold: "800",
				black: "900",
			},
			screens: {
				"custom-1240": "1240px",
			},
		},
	},
	plugins: [],
};
export default config;
