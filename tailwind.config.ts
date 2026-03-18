import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        leather: {
          50: "#faf7f2",
          100: "#f2ebe0",
          200: "#e5d6c4",
          300: "#d4bc9e",
          400: "#c19d73",
          500: "#b0865a",
          600: "#a2744e",
          700: "#865d42",
          800: "#6e4d38",
          900: "#5a4031",
          950: "#302118",
        },
      },
    },
  },
  plugins: [],
};
export default config;
