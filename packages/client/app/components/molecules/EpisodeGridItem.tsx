import React, { forwardRef, useMemo } from "react"
import { type Episode, EpisodeType } from "muvel-api-types"
import { Button, type ButtonProps, Skeleton } from "@chakra-ui/react"
import { useNavigate } from "react-router"
import { Tooltip } from "~/components/ui/tooltip"

export type EpisodeItemProps = ButtonProps & {
  episode: Episode
  loading?: boolean
}

const EpisodeGridItem = forwardRef<HTMLButtonElement, EpisodeItemProps>(
  ({ episode, loading, ...props }, ref) => {
    const navigate = useNavigate()

    const episodeCountText = useMemo(() => {
      if (episode.episodeType === EpisodeType.Episode) {
        return `${Math.round(parseFloat(episode.order.toString()))}편`
      } else if (episode.episodeType === EpisodeType.Prologue) {
        return "프롤로그"
      } else if (episode.episodeType === EpisodeType.Epilogue) {
        return "에필로그"
      } else if (episode.episodeType === EpisodeType.Special) {
        return "특별편"
      }
    }, [episode.episodeType, episode.order])

    return (
      <Skeleton w={"60px"} loading={!!loading}>
        <Tooltip content={episode.title}>
          <Button
            size={"sm"}
            w={"60px"}
            variant={"ghost"}
            userSelect={"none"}
            gap={5}
            onClick={() => navigate(`/episodes/${episode.id}`)}
            ref={ref}
            {...props}
          >
            {episodeCountText}{" "}
          </Button>
        </Tooltip>
      </Skeleton>
    )
  },
)

export default EpisodeGridItem
