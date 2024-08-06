import React from "react"
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable"
import { StackProps, VStack } from "@chakra-ui/react"
import { Novel } from "../../types/novel.type"
import SortableEpisodeItem from "../molecules/SortableEpisodeItem"
import { NovelDetailPageSkeleton } from "../pages/NovelDetailPage"

const SortableEpisodeList2: React.FC<
  { novel: Novel; isNarrow?: boolean; isLoading?: boolean } & StackProps
> = ({ novel, isNarrow, isLoading, ...props }) => {
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
    })
  )

  return !isLoading ? (
    <DndContext
      sensors={sensors}
      onDragEnd={(e) => {
        console.log("drag end", e)
      }}
    >
      <SortableContext items={novel.episodes} strategy={rectSortingStrategy}>
        <VStack alignItems={"baseline"} {...props}>
          {novel.episodes.map((episode, idx) => (
            <SortableEpisodeItem
              episode={episode}
              index={idx}
              isDrawer={isNarrow}
              key={episode.id}
            />
          ))}
        </VStack>
      </SortableContext>
    </DndContext>
  ) : (
    <VStack {...props}>
      <NovelDetailPageSkeleton />
      <NovelDetailPageSkeleton />
      <NovelDetailPageSkeleton />
      <NovelDetailPageSkeleton />
      <NovelDetailPageSkeleton />
    </VStack>
  )
}

export default SortableEpisodeList2
