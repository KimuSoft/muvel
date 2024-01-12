import NovelDetailTemplate from "../templates/NovelDetailTemplate"
import React, { useEffect } from "react"
import { initialNovel, Novel } from "../../types/novel.type"
import { api } from "../../utils/api"
import { Skeleton, useToast } from "@chakra-ui/react"
import { useNavigate, useParams } from "react-router-dom"
import { isAxiosError } from "axios"
import { Episode, EpisodeType } from "../../types/episode.type"

const NovelDetailPage = () => {
  const toast = useToast()
  const navigate = useNavigate()
  const novelId = useParams<{ id: string }>().id || ""

  const [novel, setNovel] = React.useState<Novel>(initialNovel)
  const [isLoading, setIsLoading] = React.useState(false)

  const fetchNovel = async () => {
    setIsLoading(true)

    let novel: Novel | null = null
    try {
      novel = (await api.get<Novel>(`/novels/${novelId}`)).data
    } catch (e) {
      if (!isAxiosError(e)) return
      switch (e.response?.status) {
        case 401:
          toast({
            title: "로그인이 필요해요!",
            description: "로그인을 하고 다시 시도해주세요.",
            status: "info",
          })
          window.location.href = import.meta.env.VITE_API_BASE + "/auth/login"
          return
        case 403:
          toast({
            title: "권한 부족",
            description: "이 소설을 볼 권한이 부족해요!",
            status: "error",
          })
          break
        case 404:
          toast({
            title: "소설 찾기 실패",
            description: "어... 그런 소설이 있나요?",
            status: "error",
          })
          break
        case 500:
          toast({
            title: "서버 오류",
            description: "서버에서 오류가 발생했어요!",
            status: "error",
          })
          break
        default:
          toast({
            title: "알 수 없는 오류가 발생했어요!",
            description: e.message,
            status: "error",
          })
      }

      return navigate("/novels")
    }

    setNovel(novel)
    setIsLoading(false)
  }

  // 임시
  const addEpisode = async () => {
    setIsLoading(true)
    const { data } = await api.post<Episode>(`novels/${novelId}/episodes`, {
      title: "새 에피소드",
      episodeType: EpisodeType.Episode,
    })

    navigate(`/episodes/${data.id}`)
    toast({
      title: "새 에피소드를 생성했어요!",
      status: "success",
    })
  }

  useEffect(() => {
    fetchNovel().then()
  }, [])

  return (
    <NovelDetailTemplate
      novel={novel}
      isLoading={isLoading}
      updateNovelHandler={fetchNovel}
      createNovelHandler={addEpisode}
    />
  )
}

export const NovelDetailPageSkeleton = () => {
  return <Skeleton w={"100%"} h={"54px"} />
}

export default NovelDetailPage
