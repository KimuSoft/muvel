import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core"
import { WidgetZone } from "./WidgetZone"
import { SortableWidget } from "../components/SortableWidget"
import type { WidgetId } from "../components/widgetMap"
import {
  useWidgetLayout,
  type WidgetSide,
} from "~/features/editor/widgets/context/WidgetContext" // 경로 수정 (WidgetLayoutContext -> WidgetContext)
import { useOption } from "~/context/OptionContext"

export const WidgetPanel = () => {
  // useWidgetLayout 훅은 WidgetContext에서 가져오도록 수정 필요
  const { layout, updateLayout } = useWidgetLayout()
  const [option] = useOption()

  // useEffect는 디버깅용으로 남겨둡니다.
  // useEffect(() => {
  //   console.log("Layout updated:", layout);
  // }, [layout]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return // 자기 자신 위로 드롭된 경우 무시

    const activeId = active.id as WidgetId
    // over.id가 'left' 또는 'right' 문자열일 수도 있고, 다른 위젯 ID일 수도 있음
    const overId = over.id as WidgetId | WidgetSide

    const allSides: WidgetSide[] = ["left", "right"]

    // 드래그 시작된 사이드 찾기
    const fromSide = allSides.find((side) => layout[side].includes(activeId))
    if (!fromSide) return // 시작 사이드를 찾을 수 없으면 종료

    // 드롭된 대상이 위젯인지, 아니면 Zone 자체인지 판별
    let toSide: WidgetSide
    let targetWidgetId: WidgetId | null = null // 드롭 대상 위젯 ID (없으면 null)

    if (allSides.includes(overId as WidgetSide)) {
      // Zone 자체에 드롭된 경우
      toSide = overId as WidgetSide
    } else {
      // 다른 위젯 위에 드롭된 경우, 해당 위젯이 속한 사이드를 toSide로 설정
      targetWidgetId = overId as WidgetId
      const foundSide = allSides.find((side) =>
        layout[side].includes(targetWidgetId!),
      )
      if (!foundSide) return // 드롭 대상 위젯의 사이드를 찾을 수 없으면 종료
      toSide = foundSide
    }

    // --- updateLayout 호출 부분을 수정 ---
    updateLayout((draft) => {
      // 1. 시작 리스트(fromList)에서 드래그된 아이템(activeId) 제거
      const currentFromList = draft[fromSide]
      const filteredFromList = currentFromList.filter((id) => id !== activeId)
      draft[fromSide] = filteredFromList // draft의 fromSide 업데이트

      // 2. 도착 리스트(toList) 결정
      //    (주의: fromSide와 toSide가 같을 경우, 이미 위에서 필터링된 리스트를 사용해야 함)
      const currentToList =
        fromSide === toSide ? filteredFromList : draft[toSide]

      // 3. 삽입 위치(insertAt) 계산
      let insertAt: number
      if (targetWidgetId) {
        // 다른 위젯 위에 드롭: 해당 위젯의 인덱스를 찾음
        const overIndex = currentToList.indexOf(targetWidgetId)
        insertAt = overIndex >= 0 ? overIndex : currentToList.length // 찾지 못하면 맨 끝
      } else {
        // Zone 자체에 드롭: 리스트의 맨 끝에 삽입
        insertAt = currentToList.length
      }

      // 4. 도착 리스트(toList)에 드래그된 아이템(activeId) 삽입
      const resultToList = [
        ...currentToList.slice(0, insertAt),
        activeId,
        ...currentToList.slice(insertAt),
      ]
      draft[toSide] = resultToList // draft의 toSide 업데이트

      // 5. 이동이 없는 경우 체크 (선택적 최적화)
      //    (시작 리스트와 결과 리스트가 동일하면 업데이트 취소 - Immer가 자동으로 처리해줄 수도 있음)
      //    단, 이 로직은 복잡성을 증가시킬 수 있으므로 꼭 필요하지 않으면 생략 가능
      // const originalIndex = layout[fromSide].indexOf(activeId);
      // if (fromSide === toSide && JSON.stringify(layout[fromSide]) === JSON.stringify(resultToList)) {
      //    // 변경 사항이 없으면 여기서 함수를 종료하거나, immer가 처리하도록 둠
      //    // (주의: 이 비교는 단순 배열 순서 변경 외 다른 요인이 없다면 작동)
      //    console.log("No actual move detected.");
      //    return; // 변경사항 없음
      // }
    })
  }

  return (
    // DndContext 및 WidgetZone 렌더링 부분은 동일하게 유지
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <WidgetZone
        side="left"
        widgetIds={layout.left}
        display={{ base: "none", xl: "flex" }}
        position={"fixed"}
        width={{
          base: `calc(100vw - ${option.editorMaxWidth}px)`,
          xl: `calc(50vw - (${option.editorMaxWidth}px / 2))`,
        }}
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
        display={{ base: "none", md: "flex" }}
        position={"fixed"}
        w={{
          base: `calc(100vw - ${option.editorMaxWidth}px)`,
          xl: `calc(50vw - (${option.editorMaxWidth}px / 2))`,
        }}
        maxW={"350px"}
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
