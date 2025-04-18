import type { Route } from "./+types/note"
import { type LoaderFunctionArgs, useLoaderData } from "react-router"
import { api } from "~/utils/api"

export function meta({ data }: Route.MetaArgs) {
  if (!data?.note) {
    return [
      { title: "Muvel" },
      { name: "description", content: "존재하지 않는 노트예요." },
    ]
  }

  return [
    { title: `${data.note.name} (${data.note.novel.title}) - Muvel` },
    {
      name: "description",
      content: data.note.description.slice(0, 100) || "빈 노트",
    },
  ]
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const id = params.id
  const cookie = request.headers.get("cookie") ?? ""

  if (!id) {
    throw new Response("Not Found", { status: 404 })
  }

  const { data: note } = await api.get<any>(`/notes/${id}`, {
    headers: { cookie },
    withCredentials: true,
  })

  return { note }
}

export default function Main() {
  const { note } = useLoaderData<typeof loader>()

  return note
}
