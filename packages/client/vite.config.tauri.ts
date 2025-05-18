import baseConfig from "./vite.config"
import { defineConfig } from "vite"

export default defineConfig({
  ...baseConfig,
  // rollupOptions 덮어씀
  build: { outDir: "build-tauri" },
})
