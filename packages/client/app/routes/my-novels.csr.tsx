import MyNovelsTemplate from "~/components/templates/MyNovelsTemplate"
import { useLoaderData } from "react-router"
import { api } from "~/utils/api"
import type { Novel } from "muvel-api-types"
import { getMe } from "~/services/api/api.user"

export async function clientLoader() {
  const user = await getMe()
  if (!user) return { novels: [] }

  const { data: novels } = await api.get<Novel[]>(`/users/${user.id}/novels`)

  return { novels }
}

export default function Main() {
  const { novels } = useLoaderData<typeof clientLoader>()

  return <MyNovelsTemplate novels={novels} />
}
