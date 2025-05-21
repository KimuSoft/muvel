import { useLoaderData } from "react-router"
import MainTemplate from "~/components/templates/MainTemplate"
import { getMe, getMyRecentNovels } from "~/services/api/api.user"
import { getMyLocalNovels } from "~/services/tauri/novelStorage"
import type { Novel, User } from "muvel-api-types"

export async function clientLoader() {
  let user: User | void | null = null
  let cloudNovels: Novel[] = []

  // API 서버 연결 이슈 / 버전 호환 이슈 고려
  try {
    user = await getMe()
    cloudNovels = user ? await getMyRecentNovels() : []
  } catch (e) {
    console.warn("Error fetching user count:", e)
  }

  const localNovels = (await getMyLocalNovels()) || []

  // 어쩔 수 없이 로컬 판은 updatedAt 기준으로 정렬
  const novels = [...cloudNovels, ...localNovels].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )

  return { novels }
}

export default function Main() {
  const { novels } = useLoaderData<typeof clientLoader>()

  return <MainTemplate novels={novels || []} />
}
