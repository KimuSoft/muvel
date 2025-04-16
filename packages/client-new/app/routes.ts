import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/main.tsx"),
  route("auth/login", "routes/auth-callback.tsx"),
  route("novels/:id", "routes/novel.tsx"),
] satisfies RouteConfig
