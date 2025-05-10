import { index, route, type RouteConfig } from "@react-router/dev/routes"

const SsrRoutes = [
  index("routes/main.tsx"),
  route("my-novels", "routes/my-novels.tsx"),
  route("novels/:id", "routes/novel.tsx"),
  route("episodes/:id", "routes/episode.tsx"),
  route("characters/:id", "routes/character.tsx"),
  route("privacy-policy", "routes/privacy-policy.tsx"),
  route("terms-of-use", "routes/terms-of-use.tsx"),
  route("info", "routes/info.tsx"),
  // 인증 및 기타 콜백
  route("auth/login", "routes/auth-callback.tsx"),
  route("auth/logout", "routes/auth-logout.tsx"),
] satisfies RouteConfig

const CsrRoutes = [
  index("routes/main.csr.tsx"),
  route("my-novels", "routes/my-novels.csr.tsx"),
  route("novels/:id", "routes/novel.csr.tsx"),
  route("episodes/:id", "routes/episode.csr.tsx"),

  // SSR 공통
  route("privacy-policy", "routes/privacy-policy.tsx"),
  route("terms-of-use", "routes/terms-of-use.tsx"),
  route("info", "routes/info.tsx"),
] satisfies RouteConfig

// export default CsrRoutes
console.info(`Using ${!process.env.VITE_TAURI ? "SSR" : "CSR"} routes`)
export default !process.env.VITE_TAURI ? SsrRoutes : CsrRoutes
