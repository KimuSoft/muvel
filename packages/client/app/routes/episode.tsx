import type { Route } from "./+types/episode"
import { type LoaderFunctionArgs, useLoaderData } from "react-router"
import { api } from "~/utils/api"
import BlockEditorPage from "~/features/block-editor/BlockEditorPage"
import { BlockEditorProvider } from "~/features/block-editor/context/EditorContext"
import OptionProvider from "~/providers/OptionProvider"
import { EditorType, type GetEpisodeResponseDto } from "muvel-api-types"
import EditorPage from "~/features/editor/EditorPage"

export function meta({ data }: Route.MetaArgs) {
  if (!data?.episode) {
    return [
      { title: "Muvel" },
      { name: "description", content: "존재하지 않는 에피소드예요." },
    ]
  }

  return [
    { title: `${data.episode.title} (${data.episode.novel.title}) - Muvel` },
    {
      name: "description",
      content:
        data.episode.description.slice(0, 100) || "새로운 소설을 감상해보세요!",
    },
  ]
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const id = params.id
  const cookie = request.headers.get("cookie") ?? ""

  if (!id) {
    throw new Response("Not Found", { status: 404 })
  }

  const { data: episode } = await api.get<GetEpisodeResponseDto>(
    `/episodes/${id}`,
    {
      headers: { cookie },
      withCredentials: true,
    },
  )

  return { episode }
}

export default function Main() {
  const { episode } = useLoaderData<typeof loader>()

  switch (episode.editor) {
    case EditorType.Block:
      return (
        <OptionProvider>
          <BlockEditorProvider>
            <BlockEditorPage />
          </BlockEditorProvider>
        </OptionProvider>
      )
    case EditorType.Flow:
      return <div>Muvel Flow Editor</div>
    case EditorType.RichText:
      return <EditorPage episode={episode} />
    default:
      return <div>Unknown Editor Type: {JSON.stringify(episode, null, 2)}</div>
  }
}
