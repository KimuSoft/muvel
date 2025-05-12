import MyNovelsTemplate from "~/components/templates/MyNovelsTemplate"
import { useLoaderData } from "react-router"
import { getMe, getUserCloudNovels } from "~/services/api/api.user"
import { getMyLocalNovels } from "~/services/tauri/novelStorage"

export async function clientLoader() {
  const user = await getMe()

  const novels = user ? await getUserCloudNovels(user?.id) : []
  const localNovels = await getMyLocalNovels()
  console.log("localNovels", localNovels)
  return { novels, localNovels }
}

export default function Main() {
  const { novels, localNovels } = useLoaderData<typeof clientLoader>()

  return <MyNovelsTemplate novels={novels} localNovels={localNovels} />
}
