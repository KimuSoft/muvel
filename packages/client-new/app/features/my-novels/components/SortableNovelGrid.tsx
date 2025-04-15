import React from "react"
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable"
import { SimpleGrid } from "@chakra-ui/react"
import type { Novel } from "~/types/novel.type"
import SortableNovelItem from "~/features/my-novels/components/SortableNovelItem"

const SortableNovelGrid: React.FC<{ novels: Novel[]; column?: number }> = ({
  novels,
  column = 1,
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

  return (
    <DndContext
      sensors={sensors}
      onDragStart={() => {
        console.log("drag start")
      }}
      onDragEnd={() => {
        console.log("drag end")
      }}
    >
      <SortableContext items={novels} strategy={rectSortingStrategy}>
        <SimpleGrid
          w={"100%"}
          columns={column}
          gridColumnGap={4}
          gridRowGap={0}
        >
          {novels.map((novel) => (
            <SortableNovelItem novel={novel} key={novel.id} />
          ))}
        </SimpleGrid>
      </SortableContext>
    </DndContext>
  )
}

export default SortableNovelGrid
