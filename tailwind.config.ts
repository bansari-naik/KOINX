import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#070910",
        panel: "#121521",
        panelAlt: "#0d111c",
        border: "#263356",
        text: "#f4f7ff",
        muted: "#9aa7c7",
        positive: "#4be3a1",
        negative: "#ff6b81",
      },
      boxShadow: {
        panel: "0 18px 40px rgba(0, 0, 0, 0.28)",
      },
      backgroundImage: {
        "card-blue": "linear-gradient(135deg, #52a4ff 0%, #1a67ff 100%)",
        "page-glow":
          "radial-gradient(circle at top left, rgba(51, 99, 255, 0.18), transparent 34%), radial-gradient(circle at top right, rgba(23, 108, 255, 0.12), transparent 26%)",
      },
      fontFamily: {
        sans: ["var(--font-manrope)"],
      },
    },
  },
  plugins: [],
};

export default config;

