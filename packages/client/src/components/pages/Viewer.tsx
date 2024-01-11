import React, { useEffect, useMemo } from "react"
import ViewerTemplate from "../templates/ViewerTemplate"
import useCurrentUser from "../../hooks/useCurrentUser"
import { useNavigate, useParams } from "react-router-dom"
import {
  blocksState,
  episodeState,
  isLoadingState,
  novelState,
} from "../../recoil/editor"
import { useRecoilState } from "recoil"
import { api } from "../../utils/api"
import { Episode, EpisodeType } from "../../types/episode.type"
import { Block } from "../../types/block.type"
import { useToast } from "@chakra-ui/react"
import { EditorType } from "../templates/editor"

const Viewer: React.FC = () => {
  const episodeId = useParams<{ id: string }>().id || ""

  const user = useCurrentUser()
  const navigate = useNavigate()

  const toast = useToast()

  // States (Data)
  const [_novel, setNovel] = useRecoilState(novelState)
  const [episode, setEpisode] = useRecoilState(episodeState)
  const [_blocks, setBlocks] = useRecoilState(blocksState)

  const [isLoading, setIsLoading] = useRecoilState(isLoadingState)

  const refresh = async () => {
    setIsLoading(true)
    const episodeRes = await api.get<Episode>(`episodes/${episodeId}`)

    if (!episodeRes.data) {
      toast({ title: "에피소드를 찾을 수 없습니다." })
      return navigate("/")
    }

    const novelRes = await api.get(`novels/${episodeRes.data.novelId}`)

    if (!novelRes.data) {
      toast({ title: "소설 정보를 찾을 수 없습니다." })
      return navigate("/")
    }

    const blocksRes = await api.get<Block[]>(`episodes/${episodeId}/blocks`)

    setNovel(novelRes.data)
    setEpisode(episodeRes.data)
    setBlocks(blocksRes.data)
    setIsLoading(false)
  }

  const editorType = useMemo(() => {
    if (isLoading) return EditorType.MuvelBlock
    if (episode.episodeType === EpisodeType.EpisodeGroup)
      return EditorType.Markdown
    return EditorType.MuvelBlock
  }, [episode.episodeType, isLoading])

  useEffect(() => {
    // 로그인되어 있지 않은 경우 로그인 페이지로 이동
    if (!user) {
      window.location.href = import.meta.env.VITE_API_BASE + "/auth/login"
      return
    }
    console.log("열렸당")
    refresh().then()
  }, [episodeId])

  return <ViewerTemplate editorType={editorType} isLoading={isLoading} />
}

export default Viewer
