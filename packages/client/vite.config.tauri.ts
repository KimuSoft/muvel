import baseConfig from "./vite.config"
import { defineConfig } from "vite"

export default defineConfig({
  ...baseConfig,
  build: { outDir: "build-tauri" },
})
