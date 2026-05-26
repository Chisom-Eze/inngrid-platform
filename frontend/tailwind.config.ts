import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        line: "#d9e2ec",
        brand: {
          50: "#eff8f6",
          100: "#d7f0eb",
          500: "#247c73",
          600: "#1f6d66",
          700: "#1c5f59"
        },
        saffron: "#d69228"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(24, 33, 47, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
