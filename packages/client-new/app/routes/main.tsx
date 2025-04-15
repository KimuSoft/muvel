import type { Route } from "./+types/main"
import MainLayout from "~/features/my-novels/MainLayout"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ]
}

export default function Main() {
  return <MainLayout />
}
