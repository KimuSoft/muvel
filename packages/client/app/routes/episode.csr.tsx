import { type ClientLoaderFunctionArgs, useLoaderData } from "react-router"
import { api } from "~/utils/api"
import {
  type Block,
  EpisodeType,
  type GetEpisodeResponseDto,
} from "muvel-api-types"
import EditorPage from "~/features/novel-editor/EditorPage"
import React from "react"
import FlowEditorPage from "~/features/flow-editor/FlowEditorPage"

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const id = params.id
  if (!id) throw new Response("Not Found", { status: 404 })

  const { data: episode } = await api.get<GetEpisodeResponseDto>(
    `/episodes/${id}`,
  )

  const { data: blocks } = await api.get<Block[]>(`/episodes/${id}/blocks`)
  // 사실 서버에서 정렬해서 없어도 되는데 불안해서 넣음
  blocks.sort((a, b) => a.order - b.order)

  return { episode, blocks }
}

export default function Main() {
  const { episode, blocks } = useLoaderData<typeof clientLoader>()

  switch (episode.episodeType) {
    case EpisodeType.Episode:
    case EpisodeType.Prologue:
    case EpisodeType.Epilogue:
    case EpisodeType.Special:
      return <EditorPage episode={episode} blocks={blocks} />
    case EpisodeType.EpisodeGroup:
      return <FlowEditorPage episode={episode} />
  }
}
