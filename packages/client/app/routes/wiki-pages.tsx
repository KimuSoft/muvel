import type { Route } from "./+types/wiki-pages"
import { type LoaderFunctionArgs, useLoaderData } from "react-router"
import { api } from "~/utils/api"
import WikiPagePage from "~/features/wiki-editor/WikiPagePage"

export function meta({ data }: Route.MetaArgs) {
  if (!data?.wikiPage) {
    return [
      { title: "Muvel" },
      { name: "description", content: "존재하지 않는 페이지예요." },
    ]
  }

  return [
    { title: `${data.wikiPage.title} (${data.wikiPage.novel.title}) - Muvel` },
    {
      name: "description",
      content:
        data.wikiPage.summary.slice(0, 100) || "새로운 소설을 감상해보세요!",
    },
  ]
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const id = params.id
  const cookie = request.headers.get("cookie") ?? ""

  if (!id) {
    throw new Response("Not Found", { status: 404 })
  }

  const { data: wikiPage } = await api.get<any>(`/characters/${id}`, {
    headers: { cookie },
    withCredentials: true,
  })

  return { wikiPage }
}

export default function Main() {
  const { wikiPage } = useLoaderData<typeof loader>()

  return <WikiPagePage initialWikiPage={wikiPage} />
}
