import { Novel } from "../../../types/novel.type"
import { StackProps } from "@chakra-ui/react"
import NovelItem from "./NovelItem"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import React from "react"

const SortableNovelItem: React.FC<{ novel: Novel } & StackProps> = ({
  novel,
  ...props
}) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id: novel.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  }

  return (
    <NovelItem
      novel={novel}
      ref={setNodeRef}
      style={style}
      borderWidth={isDragging ? 1 : 0}
      borderColor={"purple.500"}
      zIndex={isDragging ? 1 : "auto"}
      boxShadow={isDragging ? "lg" : "none"}
      {...props}
      {...attributes}
      {...listeners}
    />
  )
}

export default SortableNovelItem
