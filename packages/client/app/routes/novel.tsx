import type { Route } from "./+types/novel"
import NovelDetailTemplate from "~/components/templates/NovelDetailTemplate"
import { type LoaderFunctionArgs, useLoaderData } from "react-router"
import { api } from "~/utils/api"
import type { Novel, NovelPermissions } from "~/types/novel.type"

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

  const { data: novel } = await api.get<
    Novel & { permissions: NovelPermissions }
  >(`/novels/${id}`, {
    headers: {
      cookie, // ✅ SSR 쿠키 인증
    },
    withCredentials: true, // ✅ Nest 쪽에서 쿠키 인증 받게
  })

  return { novel }
}

export default function Novel() {
  const { novel } = useLoaderData<typeof loader>()

  return <NovelDetailTemplate novel={novel} />
}
