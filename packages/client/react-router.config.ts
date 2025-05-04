import type { Config } from "@react-router/dev/config"

const isTauri = !!process.env.VITE_TAURI
console.log(`Tauri: ${isTauri}, SSR: ${!isTauri}`)

export default {
  ssr: !isTauri,
  buildDirectory: isTauri ? "build-tauri" : "build",
} satisfies Config
