import { useLoaderData } from "react-router"
import { api } from "~/utils/api"
import type { Novel } from "muvel-api-types"
import MainTemplate from "~/components/templates/MainTemplate"
import { getMe } from "~/api/api.user"

export async function clientLoader() {
  const { data: userCount } = await api.get<number>(`/users/count`)

  const user = await getMe()
  if (!user) return { novels: [], userCount }

  const { data: novels } = await api.get<Novel[]>(`/users/recent-novels`)

  return { novels, userCount }
}

export default function Main() {
  const { novels, userCount } = useLoaderData<typeof clientLoader>()

  return <MainTemplate novels={novels} userCount={userCount} />
}
