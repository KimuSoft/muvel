import MyNovelsTemplate from "~/components/templates/MyNovelsTemplate"
import { useLoaderData } from "react-router"
import { getMe } from "~/services/api/api.user"
import { getMyNovels } from "~/services/novelService"

export async function clientLoader() {
  const user = await getMe()

  const novels = await getMyNovels(user?.id)
  return { novels }
}

export default function Main() {
  const { novels } = useLoaderData<typeof clientLoader>()

  return <MyNovelsTemplate novels={novels} />
}
