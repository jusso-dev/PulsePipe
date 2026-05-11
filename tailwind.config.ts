import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "oklch(18% 0.012 232)",
        paper: "oklch(98% 0.006 232)",
        panel: "oklch(96% 0.008 232)",
        line: "oklch(88% 0.014 232)",
        muted: "oklch(48% 0.018 232)",
        accent: "oklch(56% 0.15 178)",
        success: "oklch(52% 0.13 156)",
        warning: "oklch(54% 0.12 72)",
        danger: "oklch(58% 0.19 26)"
      }
    }
  },
  plugins: []
};

export default config;
