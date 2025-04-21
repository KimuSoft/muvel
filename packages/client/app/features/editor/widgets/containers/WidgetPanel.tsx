import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core"
import { WidgetZone } from "./WidgetZone"
import { SortableWidget } from "../components/SortableWidget"
import type { WidgetId } from "../components/widgetMap"
import { useEffect } from "react"
import {
  useWidgetLayout,
  type WidgetSide,
} from "~/features/editor/widgets/context/WidgetLayoutContext"
import { useOption } from "~/context/OptionContext"

export const WidgetPanel = () => {
  const { layout, updateLayout } = useWidgetLayout()
  const [option] = useOption()

  useEffect(() => {
    console.log("layout", layout)
  }, [layout.right])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as WidgetId
    const overId = over.id as WidgetId | WidgetSide

    const allSides: WidgetSide[] = ["left", "right"]
    const fromSide = allSides.find((side) => layout[side].includes(activeId))
    const toSide =
      allSides.find((side) => layout[side].includes(overId as WidgetId)) ??
      (overId as WidgetSide)

    if (!fromSide || !toSide) return

    const fromList = layout[fromSide]
    const toList = layout[toSide]

    // 🧠 remove activeId from original list
    const filtered = fromList.filter((id) => id !== activeId)

    // ✅ use filtered list to calculate drop target position
    const overIndex = filtered.indexOf(overId as WidgetId)
    const insertAt = overIndex >= 0 ? overIndex : filtered.length

    // 🛑 If same side and insertAt == original index → no movement
    const originalIndex = fromList.indexOf(activeId)
    if (fromSide === toSide && insertAt === originalIndex) return

    const updated = { ...layout }

    updated[fromSide] = filtered

    if (fromSide === toSide) {
      // Same side → just insert back in new position
      updated[toSide] = [
        ...filtered.slice(0, insertAt),
        activeId,
        ...filtered.slice(insertAt),
      ]
    } else {
      // Different side → insert into toSide
      updated[toSide] = [
        ...toList.slice(0, insertAt),
        activeId,
        ...toList.slice(insertAt),
      ]
    }

    updateLayout(updated)
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <WidgetZone
        side="left"
        widgetIds={layout.left}
        display={{ base: "none", xl: "flex" }}
        position={"fixed"}
        w={`calc(50vw - (${option.editorMaxWidth}px / 2))`}
        maxW={"300px"}
        left={3}
        bottom={3}
        p={3}
      >
        {layout.left.map((id) => (
          <SortableWidget id={id} key={id} />
        ))}
      </WidgetZone>

      <WidgetZone
        side="right"
        widgetIds={layout.right}
        display={{ base: "none", xl: "flex" }}
        position={"fixed"}
        w={`calc(50vw - (${option.editorMaxWidth}px / 2))`}
        maxW={"300px"}
        right={3}
        bottom={3}
        p={3}
      >
        {layout.right.map((id) => (
          <SortableWidget id={id} key={id} />
        ))}
      </WidgetZone>
    </DndContext>
  )
}
