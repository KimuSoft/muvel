import React from "react"
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable"
import { type StackProps, VStack } from "@chakra-ui/react"
import type { Episode } from "muvel-api-types"
import SortableEpisodeItem from "../molecules/SortableEpisodeItem"

const SortableEpisodeList: React.FC<
  {
    episodes: Episode[]
    isNarrow?: boolean
    isLoading?: boolean
  } & StackProps
> = ({ episodes, isNarrow, isLoading, ...props }) => {
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

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={(e) => {
        console.log("drag end", e)
      }}
    >
      <SortableContext
        id={"episode-sort"}
        items={episodes}
        strategy={rectSortingStrategy}
      >
        <VStack alignItems={"baseline"} p={0} {...props}>
          {episodes.map((episode, idx) => (
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
  )
}

export default SortableEpisodeList
