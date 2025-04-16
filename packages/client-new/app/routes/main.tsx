import type { Route } from "./+types/main"
import MainLayout from "~/features/my-novels/MainLayout"
import { type LoaderFunctionArgs, useLoaderData } from "react-router"
import { api } from "~/utils/api"
import type { Novel } from "~/types/novel.type"
import { getUserFromRequest } from "~/utils/session.server"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "뮤블" },
    { name: "description", content: "Welcome to React Router!" },
  ]
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const cookie = request.headers.get("cookie") ?? ""

  const user = await getUserFromRequest(request)
  if (!user) return { myNovels: [] }

  const { data: myNovels } = await api.get<Novel[]>(
    `/users/${user.id}/novels`,
    {
      headers: { cookie },
      withCredentials: true,
    },
  )

  return { myNovels }
}

export default function Main() {
  const { myNovels } = useLoaderData<typeof loader>()

  return <MainLayout novels={myNovels} />
}
