import type { Route } from "./+types/main"
import { type LoaderFunctionArgs, useLoaderData } from "react-router"
import { getUserFromRequest } from "~/utils/session.server"
import MainTemplate from "~/components/templates/MainTemplate"
import { getUserCloudNovels, getUserCount } from "~/services/api/api.user"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Muvel" },
    { name: "description", content: "뮤블: 당신의 이야기를 위한 작은 방" },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = request.headers.get("cookie") ?? ""

  const userCount = await getUserCount()
  const user = await getUserFromRequest(request)
  if (!user) return { novels: [], userCount }

  const novels = await getUserCloudNovels(user.id, {
    headers: { cookie },
    withCredentials: true,
  })

  return { novels, userCount }
}

export default function Main() {
  const { novels, userCount } = useLoaderData<typeof loader>()

  return <MainTemplate novels={novels} userCount={userCount} />
}
