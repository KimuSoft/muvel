import type { Route } from "./+types/main"
import { type LoaderFunctionArgs, useLoaderData } from "react-router"
import { api } from "~/utils/api"
import type { Novel } from "muvel-api-types"
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

  const { data: userCount } = await api.get<number>(`/users/count`)

  const user = await getUserFromRequest(request)
  if (!user) return { novels: [], userCount }

  const { data: novels } = await api.get<Novel[]>(`/users/recent-novels`, {
    headers: { cookie },
    withCredentials: true,
  })

  return { novels, userCount }
}

export default function Main() {
  const { novels, userCount } = useLoaderData<typeof loader>()

  return <MainTemplate novels={novels} userCount={userCount} />
}
