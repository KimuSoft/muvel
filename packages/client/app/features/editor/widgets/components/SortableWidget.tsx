import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { WidgetBase, WidgetHeader, WidgetTitle, WidgetBody } from "./WidgetBase"
import { widgetMap, type WidgetId } from "./widgetMap"

export const SortableWidget = ({ id }: { id: WidgetId }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const WidgetComponent = widgetMap[id]

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
    width: "100%",
  }

  return (
    <div ref={setNodeRef} style={style}>
      {WidgetComponent ? (
        <WidgetComponent
          dragAttributes={attributes}
          dragListeners={listeners}
        />
      ) : (
        <p>Unknown Widget</p>
      )}
    </div>
  )
}
