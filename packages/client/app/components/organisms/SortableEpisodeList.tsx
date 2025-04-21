import React from "react"
import {
  DndContext,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable"
import { type StackProps, VStack } from "@chakra-ui/react"
import type { Episode } from "muvel-api-types"
import SortableEpisodeItem from "../molecules/SortableEpisodeItem"
import { type ReorderedEpisode, reorderEpisode } from "~/utils/reorderEpisode"

const SortableEpisodeList: React.FC<
  {
    episodes: Episode[]
    isNarrow?: boolean
    loading?: boolean
    disableSort?: boolean
    onEpisodesChange?: (diffEpisodes: ReorderedEpisode[]) => void
  } & StackProps
> = ({
  episodes,
  isNarrow,
  loading,
  onEpisodesChange,
  disableSort,
  ...props
}) => {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 50,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 1,
      },
    }),
  )

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e

    if (!over || active.id === over.id) return

    const oldIndex = episodes.findIndex((ep) => ep.id === active.id)
    const newIndex = episodes.findIndex((ep) => ep.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...episodes]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    const updatedEpisodes = reorderEpisode(reordered)

    onEpisodesChange?.(updatedEpisodes)
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext
        disabled={loading || disableSort}
        id={"episode-sort"}
        items={episodes}
        strategy={rectSortingStrategy}
      >
        <VStack alignItems={"baseline"} p={0} w={"100%"} {...props}>
          {episodes.map((episode, idx) => (
            <SortableEpisodeItem
              key={episode.id}
              episode={episode}
              index={idx}
              isDrawer={isNarrow}
              loading={loading}
            />
          ))}
        </VStack>
      </SortableContext>
    </DndContext>
  )
}

export default SortableEpisodeList
