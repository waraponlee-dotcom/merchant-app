import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c1b3a", brand: "#4a3fe0", mint: "#4fd1b5", mintink: "#178a72",
        canvas: "#f6f4ff", line: "#e4e0f2", muted: "#6b6a8a",
        sun: "#ffc857", amberink: "#a8670f", rose: "#ff5d73", roseink: "#e0344f",
      },
      fontFamily: { sans: ["var(--font-thai)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
