import NovelDetailTemplate from "~/components/templates/NovelDetailTemplate"
import { type ClientLoaderFunctionArgs, useLoaderData } from "react-router"
import { getNovel } from "~/services/novelService"

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const id = params.id
  if (!id) throw new Response("Not Found", { status: 404 })

  const novel = await getNovel(id)
  return { novel }
}

export default function Novel() {
  const { novel } = useLoaderData<typeof clientLoader>()

  return <NovelDetailTemplate novel={novel} />
}
