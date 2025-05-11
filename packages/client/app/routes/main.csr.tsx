import { useLoaderData } from "react-router"
import { api } from "~/utils/api"
import MainTemplate from "~/components/templates/MainTemplate"
import { getMe, getMyRecentNovels } from "~/services/api/api.user"
import { getMyLocalNovels } from "~/services/tauri/novelStorage"

export async function clientLoader() {
  const { data: userCount } = await api.get<number>(`/users/count`)

  const user = await getMe()

  const cloudNovels = user ? await getMyRecentNovels() : []
  const localNovels = (await getMyLocalNovels()) || []

  // 어쩔 수 없이 로컬 판은 updatedAt 기준으로 정렬
  const novels = [...cloudNovels, ...localNovels].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )

  return { novels, userCount }
}

export default function Main() {
  const { novels, userCount } = useLoaderData<typeof clientLoader>()

  return <MainTemplate novels={novels || []} />
}
