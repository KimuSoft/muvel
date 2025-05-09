import type { Route } from "./+types/main"
import MyNovelsTemplate from "~/components/templates/MyNovelsTemplate"
import { type LoaderFunctionArgs, useLoaderData } from "react-router"
import { getUserFromRequest } from "~/utils/session.server"
import { getUserNovels } from "~/services/api/api.user"

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

  const novels = await getUserNovels(user.id, {
    headers: { cookie },
    withCredentials: true,
  })

  return { novels }
}

export default function Main() {
  const { novels } = useLoaderData<typeof loader>()

  return <MyNovelsTemplate novels={novels} />
}
