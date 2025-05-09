import { useLoaderData } from "react-router"
import { api } from "~/utils/api"
import MainTemplate from "~/components/templates/MainTemplate"
import { getMe, getMyRecentNovels } from "~/services/api/api.user"

export async function clientLoader() {
  const { data: userCount } = await api.get<number>(`/users/count`)

  const user = await getMe()
  if (!user) return { novels: [], userCount }

  const novels = await getMyRecentNovels()

  return { novels, userCount }
}

export default function Main() {
  const { novels, userCount } = useLoaderData<typeof clientLoader>()

  return <MainTemplate novels={novels} userCount={userCount} />
}
