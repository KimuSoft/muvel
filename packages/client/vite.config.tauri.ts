// packages/client/vite.config.tauri.ts
import baseConfig from "./vite.config"
import { defineConfig } from "vite"

export default defineConfig({
  ...baseConfig,
  define: {
    ...(baseConfig.define || {}),
    "process.env.TAURI": JSON.stringify(true), // 👈 이걸로 SSR off
  },
})
