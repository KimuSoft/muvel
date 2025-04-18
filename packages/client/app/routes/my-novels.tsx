import type { Route } from "./+types/main"
import MyNovelsTemplates from "~/features/my-novels/MyNovelsTemplates"
import { type LoaderFunctionArgs, useLoaderData } from "react-router"
import { api } from "~/utils/api"
import type { Novel } from "~/types/novel.type"
import { getUserFromRequest } from "~/utils/session.server"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "내 작품 - Muvel" },
    { name: "description", content: "뮤블: 당신의 이야기를 위한 작은 방" },
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

  return <MyNovelsTemplates novels={myNovels} />
}
