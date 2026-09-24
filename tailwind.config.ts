import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202A",
        navy: "#102331",
        coral: "#F26B4F",
        sand: "#F6F4EF",
        mint: "#D9F2E7",
        sky: "#DDECF5",
        fog: "#EEF1F2",
        line: "#DDE3E5"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(16, 35, 49, 0.08)",
        card: "0 8px 24px rgba(16, 35, 49, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;