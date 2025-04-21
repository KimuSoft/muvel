import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import React from "react"
import EpisodeItem, { type EpisodeItemProps } from "./EpisodeItem"

const SortableEpisodeItem: React.FC<EpisodeItemProps> = ({
  episode,
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
    id: episode.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  }

  return (
    <EpisodeItem
      episode={episode}
      ref={setNodeRef}
      style={style}
      zIndex={isDragging ? 1 : "auto"}
      boxShadow={isDragging ? "lg" : "none"}
      {...props}
      {...attributes}
      {...listeners}
    />
  )
}

export default SortableEpisodeItem
