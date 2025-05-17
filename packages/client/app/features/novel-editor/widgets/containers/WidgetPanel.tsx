import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core"
import { WidgetZone } from "./WidgetZone"
import { SortableWidget } from "../components/SortableWidget"
import type { WidgetId } from "../components/widgetMap"
import { useEditorStyleOptions, useWidgetLayout } from "~/hooks/useAppOptions"
import type { WidgetSide } from "~/types/options" // WidgetSide 임포트 추가

export const WidgetPanel = () => {
  const { widgetLayout, setWidgetLayout } = useWidgetLayout()
  const [editorStyleOptions] = useEditorStyleOptions()

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = active.id as WidgetId
    const overId = over.id as WidgetId | WidgetSide

    setWidgetLayout((draftLayout) => {
      let fromSide: WidgetSide | undefined
      if (draftLayout.left.includes(activeId)) fromSide = "left"
      else if (draftLayout.right.includes(activeId)) fromSide = "right"

      if (!fromSide) {
        console.warn("드래그된 위젯의 시작 사이드를 찾을 수 없습니다.")
        return
      }

      let toSide: WidgetSide
      let targetIndex: number // 여기에 선언

      const allSides: WidgetSide[] = ["left", "right"]

      // over.id가 'left' 또는 'right' 문자열 중 하나인지 확인 (WidgetSide 타입인지)
      const isOverIdWidgetSide = allSides.includes(overId as WidgetSide)

      if (isOverIdWidgetSide) {
        toSide = overId as WidgetSide
        targetIndex = draftLayout[toSide].length // Zone 자체에 드롭되면 해당 Zone의 맨 끝으로
      } else {
        // 다른 위젯 위에 드롭된 경우
        let foundTargetSide: WidgetSide | undefined
        let foundTargetIndex: number = -1 // 초기화

        for (const side of allSides) {
          const indexInSide = draftLayout[side].indexOf(overId as WidgetId)
          if (indexInSide !== -1) {
            foundTargetSide = side
            foundTargetIndex = indexInSide // 드롭된 위젯의 인덱스
            break
          }
        }

        if (!foundTargetSide || foundTargetIndex === -1) {
          console.warn("드롭 영역의 대상 사이드를 찾을 수 없습니다.")
          return // 여기서 함수가 종료되므로 targetIndex가 할당되지 않은 상태로 사용될 일 없음
        }
        toSide = foundTargetSide
        targetIndex = foundTargetIndex
      }

      const itemToMove = activeId

      // 1. 시작 리스트에서 아이템 제거
      const originalList = draftLayout[fromSide]
      const itemIndexInOriginal = originalList.indexOf(itemToMove)
      if (itemIndexInOriginal > -1) {
        originalList.splice(itemIndexInOriginal, 1)
      } else {
        console.warn("드래그된 아이템을 시작 리스트에서 찾을 수 없습니다.")
        return
      }

      // 2. 도착 리스트에 아이템 삽입
      // targetIndex가 드롭 대상 위젯의 인덱스이므로, 그 위치에 삽입합니다.
      // Zone 자체에 드롭된 경우 (targetIndex가 해당 Zone의 length) 맨 끝에 추가됩니다.
      draftLayout[toSide].splice(targetIndex, 0, itemToMove)
    })
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <WidgetZone
        side="left"
        widgetIds={widgetLayout.left}
        display={{ base: "none", xl: "flex" }}
        position={"fixed"}
        width={{
          base: `calc(100vw - ${editorStyleOptions.editorMaxWidth}px)`,
          xl: `calc(50vw - (${editorStyleOptions.editorMaxWidth}px / 2))`,
        }}
        maxW={"300px"}
        left={3}
        bottom={3}
        p={3}
      >
        {widgetLayout.left.map((id) => (
          <SortableWidget id={id} key={id} />
        ))}
      </WidgetZone>

      <WidgetZone
        side="right"
        widgetIds={widgetLayout.right}
        display={{ base: "none", md: "flex" }}
        position={"fixed"}
        w={{
          base: `calc(100vw - ${editorStyleOptions.editorMaxWidth}px)`,
          xl: `calc(50vw - (${editorStyleOptions.editorMaxWidth}px / 2))`,
        }}
        maxW={"350px"}
        right={3}
        bottom={3}
        p={3}
      >
        {widgetLayout.right.map((id) => (
          <SortableWidget id={id} key={id} />
        ))}
      </WidgetZone>
    </DndContext>
  )
}
