import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import "dotenv/config"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, "..", "..", "package.json"), "utf-8"),
)

export default defineConfig({
  server: {
    allowedHosts: [".kimustory.net"],
    proxy: {
      "/api":
        process.env.API_PROXY?.replace("/api", "") || "http://localhost:2556",
    },
  },
  build: {
    rollupOptions: {
      external: [
        "@tauri-apps/api",
        "@tauri-apps/plugin-dialog",
        "@tauri-apps/plugin-opener",
        "@tauri-apps/plugin-process",
        "@tauri-apps/plugin-updater",
        "@tauri-apps/plugin-cli",
      ],
    },
  },
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(packageJson.version),
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
})
