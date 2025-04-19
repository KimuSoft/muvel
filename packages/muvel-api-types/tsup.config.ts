import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  sourcemap: true,
  splitting: false,
  clean: true,
  dts: true,
  minify: true,
})
