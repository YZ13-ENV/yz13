import shared from "@repo/tailwind-config/config";
import type { Config } from "tailwindcss";

const config: Config = {
  presets: [shared],
  content: [
    "./components/**/*.{ts,tsx,mdx}",
    "./app/**/*.{ts,tsx,mdx}",
    "./packages/ui/**/*.{ts,tsx,mdx}",
    "./microservices/**/*.{ts,tsx,mdx}",
  ],
  corePlugins: {
    preflight: true,
  },
};

export default config;
