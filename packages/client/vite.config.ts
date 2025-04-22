import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import "dotenv/config"

export default defineConfig({
  server: {
    allowedHosts: [".kimustory.net"],
    proxy: { "/api": process.env.API_PROXY || "http://localhost:2556" },
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
})
