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
import type { Novel } from "muvel-api-types"
import SortableNovelItem from "~/components/molecules/SortableNovelItem"

const SortableNovelGrid: React.FC<{ novels: Novel[] }> = ({ novels }) => {
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
        <SimpleGrid w={"100%"} minChildWidth={"250px"} gap={2}>
          {novels.map((novel) => (
            <SortableNovelItem novel={novel} key={novel.id} />
          ))}
        </SimpleGrid>
      </SortableContext>
    </DndContext>
  )
}

export default SortableNovelGrid
