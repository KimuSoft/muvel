import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/main.tsx"),
  route("my-novels", "routes/my-novels.tsx"),
  route("novels/:id", "routes/novel.tsx"),
  route("episodes/:id", "routes/episode.tsx"),
  route("characters/:id", "routes/character.tsx"),
  route("notes/:id", "routes/note.tsx"),
  // 인증 및 기타 콜백
  route("auth/login", "routes/auth-callback.tsx"),
] satisfies RouteConfig
