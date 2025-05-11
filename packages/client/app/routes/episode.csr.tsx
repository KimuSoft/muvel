import { type ClientLoaderFunctionArgs, useLoaderData } from "react-router"
import { EpisodeType } from "muvel-api-types"
import EditorPage from "~/features/novel-editor/EditorPage"
import React from "react"
import FlowEditorPage from "~/features/flow-editor/FlowEditorPage"
import { getEpisodeById } from "~/services/episodeService"

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const id = params.id
  if (!id) throw new Response("Not Found", { status: 404 })

  const episode = await getEpisodeById(id)

  return { episode }
}

export default function Main() {
  const { episode } = useLoaderData<typeof clientLoader>()

  switch (episode.episodeType) {
    case EpisodeType.Episode:
    case EpisodeType.Prologue:
    case EpisodeType.Epilogue:
    case EpisodeType.Special:
      return <EditorPage episode={episode} />
    case EpisodeType.EpisodeGroup:
      return <FlowEditorPage episode={episode} />
  }
}
