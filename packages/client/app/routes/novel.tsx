import type { Route } from "./+types/novel"
import NovelDetailTemplate from "~/components/templates/NovelDetailTemplate"
import { type LoaderFunctionArgs, useLoaderData } from "react-router"
import { getCloudNovel } from "~/services/api/api.novel"

export function meta({ data }: Route.MetaArgs) {
  if (!data?.novel) {
    return [
      { title: "Muvel" },
      { name: "description", content: "존재하지 않는 소설이에요." },
    ]
  }

  return [
    { title: `${data.novel.title} - Muvel` },
    {
      name: "description",
      content: data.novel.description || "새로운 소설을 감상해보세요!",
    },
  ]
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const id = params.id
  const cookie = request.headers.get("cookie") ?? ""

  if (!id) {
    throw new Response("Not Found", { status: 404 })
  }

  const novel = await getCloudNovel(id, {
    headers: { cookie },
    withCredentials: true,
  })

  return { novel }
}

export default function Novel() {
  const { novel } = useLoaderData<typeof loader>()

  return <NovelDetailTemplate novel={novel} />
}
