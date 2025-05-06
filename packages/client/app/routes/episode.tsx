import type { Route } from "./+types/episode"
import { type LoaderFunctionArgs, useLoaderData } from "react-router"
import { api } from "~/utils/api"
import {
  type Block,
  EpisodeType,
  type GetEpisodeResponseDto,
} from "muvel-api-types"
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
    { headers: { cookie }, withCredentials: true },
  )

  const { data: blocks } = await api.get<Block[]>(`/episodes/${id}/blocks`, {
    headers: { cookie },
    withCredentials: true,
  })

  // 사실 서버에서 정렬해서 없어도 되는데 불안해서 넣음
  blocks.sort((a, b) => a.order - b.order)

  return { episode, blocks }
}

export default function Main() {
  const { episode, blocks } = useLoaderData<typeof loader>()

  switch (episode.episodeType) {
    case EpisodeType.Episode:
    case EpisodeType.Prologue:
    case EpisodeType.Epilogue:
    case EpisodeType.Special:
      return <EditorPage episode={episode} blocks={blocks} />
    case EpisodeType.Memo:
    case EpisodeType.EpisodeGroup:
      return <FlowEditorPage episode={episode} />
  }
}
