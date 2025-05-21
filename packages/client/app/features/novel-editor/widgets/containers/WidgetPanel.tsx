// features/novel-editor/widgets/containers/WidgetPanel.tsx

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay, // DragOverlay 임포트
  type DragStartEvent, // DragStartEvent 임포트
  PointerSensor, // PointerSensor 임포트 (MouseSensor, TouchSensor 대신 사용 가능)
  useSensor, // useSensor 임포트
  useSensors, // useSensors 임포트
} from "@dnd-kit/core"
import { WidgetZone } from "./WidgetZone"
import { SortableWidget } from "./SortableWidget"
import { type WidgetId, widgetMap } from "../components/widgetMap" // widgetMap 임포트 추가
import { useEditorStyleOptions, useWidgetLayout } from "~/hooks/useAppOptions"
import type { WidgetSide } from "~/types/options"
import React, { useState } from "react"
// WidgetBase 컴포넌트 또는 드래그 중인 아이템을 표시할 기본 컴포넌트 임포트
import { WidgetBase } from "./WidgetBase"
// 현재 드래그 중인 위젯의 실제 컴포넌트를 가져오기 위해 widgetMap 사용

export const WidgetPanel = () => {
  const { widgetLayout, setWidgetLayout } = useWidgetLayout()
  const [editorStyleOptions] = useEditorStyleOptions()
  const [activeId, setActiveId] = useState<WidgetId | null>(null) // 현재 드래그 중인 아이템의 ID

  // 센서 설정 (MouseSensor와 TouchSensor 대신 PointerSensor 사용 고려)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // PointerSensor는 마우스와 터치 이벤트를 모두 처리
      // activationConstraint: {
      //   distance: 3, // 드래그를 시작하기 위한 최소 이동 거리
      // },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as WidgetId)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null) // 드래그 종료 시 activeId 초기화
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeWidgetId = active.id as WidgetId
    const overId = over.id as WidgetId | WidgetSide // over.id는 위젯 ID 또는 Zone ID일 수 있음

    setWidgetLayout((draftLayout) => {
      let fromSide: WidgetSide | undefined
      if (draftLayout.left.includes(activeWidgetId)) fromSide = "left"
      else if (draftLayout.right.includes(activeWidgetId)) fromSide = "right"

      if (!fromSide) {
        console.warn("드래그된 위젯의 시작 사이드를 찾을 수 없습니다.")
        return
      }

      let toSide: WidgetSide
      let targetIndex: number

      const allSides: WidgetSide[] = ["left", "right"]
      const isOverIdWidgetSide = allSides.includes(overId as WidgetSide)

      if (isOverIdWidgetSide) {
        // Zone 자체에 드롭된 경우
        toSide = overId as WidgetSide
        targetIndex = draftLayout[toSide].length // 해당 Zone의 맨 끝으로
      } else {
        // 다른 위젯 위에 드롭된 경우 (overId는 다른 위젯의 ID)
        let foundTargetSide: WidgetSide | undefined
        let foundTargetIndexInSide: number = -1

        for (const side of allSides) {
          const indexInSide = draftLayout[side].indexOf(overId as WidgetId)
          if (indexInSide !== -1) {
            foundTargetSide = side
            foundTargetIndexInSide = indexInSide // 드롭된 위젯의 인덱스
            break
          }
        }

        if (!foundTargetSide || foundTargetIndexInSide === -1) {
          console.warn(
            "드롭 영역의 대상 사이드 또는 인덱스를 찾을 수 없습니다.",
          )
          return
        }
        toSide = foundTargetSide
        targetIndex = foundTargetIndexInSide // 대상 위젯의 위치에 삽입
      }

      // 1. 시작 리스트에서 아이템 제거
      const itemIndexInOriginal = draftLayout[fromSide].indexOf(activeWidgetId)
      if (itemIndexInOriginal > -1) {
        draftLayout[fromSide].splice(itemIndexInOriginal, 1)
      } else {
        console.warn("드래그된 아이템을 시작 리스트에서 찾을 수 없습니다.")
        return // 아이템을 찾지 못하면 더 이상 진행하지 않음
      }

      // 2. 도착 리스트에 아이템 삽입
      // targetIndex가 드롭 대상 위젯의 인덱스이므로, 그 위치에 삽입
      // Zone 자체에 드롭된 경우 (targetIndex가 해당 Zone의 length) 맨 끝에 추가
      draftLayout[toSide].splice(targetIndex, 0, activeWidgetId)
    })
  }

  // DragOverlay에 표시될 컴포넌트
  // 실제 드래그되는 위젯의 모양과 동일하게 만들기 위해 widgetMap에서 가져옴
  const ActiveWidgetComponent = activeId ? widgetMap[activeId] : null

  return (
    <DndContext
      sensors={sensors} // 수정된 센서 사용
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
        h={"calc(100vh - 4rem)"}
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
          base: `calc(95vw - ${editorStyleOptions.editorMaxWidth}px)`,
          xl: `calc(50vw - (${editorStyleOptions.editorMaxWidth}px / 2))`,
        }}
        maxW={"350px"}
        right={3}
        bottom={3}
        h={"calc(100vh - 4rem)"}
      >
        {widgetLayout.right.map((id) => (
          <SortableWidget id={id} key={id} />
        ))}
      </WidgetZone>

      {/* DragOverlay 추가 */}
      <DragOverlay dropAnimation={null}>
        {activeId && ActiveWidgetComponent ? (
          // ActiveWidgetComponent는 dragAttributes, dragListeners props를 받지 않도록 주의
          // DragOverlay 내부에서는 이 props들이 필요 없음
          // 필요하다면 ActiveWidgetComponent를 한 번 더 감싸서 스타일만 적용
          <WidgetBase>
            <ActiveWidgetComponent />
          </WidgetBase>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
