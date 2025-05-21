import React, { useCallback, useMemo } from "react"
import {
  DndContext,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable"
import { type StackProps, VStack } from "@chakra-ui/react"
import type { Episode } from "muvel-api-types"
import SortableEpisodeItem from "../molecules/SortableEpisodeItem" // 경로 확인 필요
import { type ReorderedEpisode, reorderEpisode } from "~/utils/reorderEpisode"
import EpisodeGrid from "~/components/organisms/EpisodeGrid"
import { useViewOptions } from "~/hooks/useAppOptions" // 경로 확인 필요

/** ------------------------------------------------------------------
 *  Types
 * ------------------------------------------------------------------*/
type SortableEpisodeListProps = StackProps & {
  episodes: Episode[]
  loading?: boolean
  disableSort?: boolean
  onEpisodesChange?: (diffEpisodes: ReorderedEpisode[]) => void
}

/** ------------------------------------------------------------------
 *  Helpers
 * ------------------------------------------------------------------*/
const ascSort = (a: Episode, b: Episode) =>
  parseFloat(a.order.toString()) - parseFloat(b.order.toString())
const toCanonicalAsc = (eps: Episode[]) => [...eps].sort(ascSort)

/** ------------------------------------------------------------------
 *  Component
 * ------------------------------------------------------------------*/
const SortableEpisodeList: React.FC<SortableEpisodeListProps> = ({
  episodes,
  loading,
  onEpisodesChange,
  disableSort,
  ...props
}) => {
  const [
    { episodeListLayout: variant, episodeListSortDirection: sortDirection },
  ] = useViewOptions()
  /** ------------------------------------------------------------------
   * Sensors
   * ------------------------------------------------------------------*/
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
  )

  /** ------------------------------------------------------------------
   * 화면에 표시할 배열 (정렬 방향 반영)
   * ------------------------------------------------------------------*/
  const displayedEpisodes = useMemo(() => {
    const asc = toCanonicalAsc(episodes)
    return sortDirection === "desc" ? asc.reverse() : asc
  }, [episodes, sortDirection])

  /** ------------------------------------------------------------------
   * DragEnd
   *  1) UI 순서대로 이동
   *  2) sortDirection 이 desc 면 다시 뒤집어 canonical(asc)로 변환
   *  3) reorderEpisode 호출
   * ------------------------------------------------------------------*/
  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e
      if (!over || active.id === over.id) return

      const oldIndex = displayedEpisodes.findIndex((ep) => ep.id === active.id)
      const newIndex = displayedEpisodes.findIndex((ep) => ep.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      // 1) UI 순서 기준으로 이동
      const uiReordered = arrayMove(displayedEpisodes, oldIndex, newIndex)

      // 2) canonical(오름차순)으로 변환
      const canonicalReordered =
        sortDirection === "desc" ? [...uiReordered].reverse() : uiReordered

      // 3) 순번 재계산 & 콜백
      const diff = reorderEpisode(canonicalReordered)
      onEpisodesChange?.(diff)
    },
    [displayedEpisodes, sortDirection, onEpisodesChange],
  )

  if (variant === "grid") {
    return <EpisodeGrid episodes={displayedEpisodes} loading={loading} />
  }

  /** ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------*/
  return (
    <VStack alignItems={"stretch"} w={"100%"} gap={1} {...props}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          disabled={loading || disableSort}
          id="episode-sort"
          items={displayedEpisodes}
          strategy={rectSortingStrategy}
        >
          {displayedEpisodes.map((episode) => (
            <SortableEpisodeItem
              key={episode.id}
              episode={episode}
              // index={idx}
              variant={variant}
              loading={loading}
            />
          ))}
        </SortableContext>
      </DndContext>
    </VStack>
  )
}

export default SortableEpisodeList
