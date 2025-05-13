// @ts-expect-error CSR 타입 로딩됐을 경우 에러 무시
import type { Route } from "./+types/character"
import { type LoaderFunctionArgs, useLoaderData } from "react-router"
import { api } from "~/utils/api"

export function meta({ data }: Route.MetaArgs) {
  if (!data?.character) {
    return [
      { title: "Muvel" },
      { name: "description", content: "존재하지 않는 캐릭터예요." },
    ]
  }

  return [
    { title: `${data.character.name} (${data.character.novel.title}) - Muvel` },
    {
      name: "description",
      content:
        data.character.description.slice(0, 100) ||
        "새로운 소설을 감상해보세요!",
    },
  ]
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const id = params.id
  const cookie = request.headers.get("cookie") ?? ""

  if (!id) {
    throw new Response("Not Found", { status: 404 })
  }

  const { data: character } = await api.get<any>(`/characters/${id}`, {
    headers: { cookie },
    withCredentials: true,
  })

  return { character }
}

export default function Main() {
  const { character } = useLoaderData<typeof loader>()

  return character
}
