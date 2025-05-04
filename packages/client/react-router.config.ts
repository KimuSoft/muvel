import type { Config } from "@react-router/dev/config"

const isTauri = process.env.TAURI === "true"
console.log(`Tauri: ${isTauri}`)

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: !isTauri,
} satisfies Config
