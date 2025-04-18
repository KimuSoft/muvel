import type { Route } from "./+types/main"
import { type LoaderFunctionArgs, useLoaderData } from "react-router"
import { api } from "~/utils/api"
import type { Novel } from "~/types/novel.type"
import { getUserFromRequest } from "~/utils/session.server"
import MainTemplate from "~/components/templates/MainTemplate"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Muvel" },
    { name: "description", content: "뮤블: 당신의 이야기를 위한 작은 방" },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
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

  return <MainTemplate novels={myNovels} />
}
