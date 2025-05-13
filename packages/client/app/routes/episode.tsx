// @ts-expect-error CSR 타입 로딩됐을 경우 에러 무시
import type { Route } from "./+types/episode"
import { type LoaderFunctionArgs, useLoaderData } from "react-router"
import { api } from "~/utils/api"
import { EpisodeType, type GetEpisodeResponseDto } from "muvel-api-types"
import EditorPage from "~/features/novel-editor/EditorPage"
import React from "react"
import FlowEditorPage from "~/features/flow-editor/FlowEditorPage"

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

  switch (episode.episodeType) {
    case EpisodeType.Episode:
    case EpisodeType.Prologue:
    case EpisodeType.Epilogue:
    case EpisodeType.Special:
      return <EditorPage episode={episode} />
    case EpisodeType.Memo:
    case EpisodeType.EpisodeGroup:
      return <FlowEditorPage episode={episode} />
  }
}
