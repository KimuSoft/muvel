import type { Route } from "./+types/main"
import MyNovelsTemplates from "~/components/templates/MyNovelsTemplates"
import { type LoaderFunctionArgs, useLoaderData } from "react-router"
import { api } from "~/utils/api"
import type { Novel } from "muvel-api-types"
import { getUserFromRequest } from "~/utils/session.server"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "내 작품 - Muvel" },
    { name: "description", content: "뮤블: 당신의 이야기를 위한 작은 방" },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = request.headers.get("cookie") ?? ""

  const user = await getUserFromRequest(request)
  if (!user) return { novels: [] }

  const { data: novels } = await api.get<Novel[]>(`/users/${user.id}/novels`, {
    headers: { cookie },
    withCredentials: true,
  })

  return { novels }
}

export default function Main() {
  const { novels } = useLoaderData<typeof loader>()

  return <MyNovelsTemplates novels={novels} />
}
