// features/novel-editor/widgets/components/SortableWidget.tsx
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { type WidgetId, widgetMap } from "../components/widgetMap"

export const SortableWidget = ({ id }: { id: WidgetId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // isDragging 상태 가져오기
  } = useSortable({ id })

  const WidgetComponent = widgetMap[id]

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    touchAction: "none",
    width: "100%",
    opacity: isDragging ? 0 : 1, // 드래그 중일 때 원래 아이템 숨김
  }

  // isDragging일 때 컴포넌트 자체를 렌더링하지 않거나, placeholder를 보여줄 수도 있습니다.
  // 여기서는 opacity를 사용하여 시각적으로만 숨깁니다.
  // if (isDragging) {
  //   return <div ref={setNodeRef} style={{ ...style, height: '50px' /* placeholder height */ }} />;
  // }

  return (
    <div ref={setNodeRef} style={style}>
      {WidgetComponent ? (
        <WidgetComponent
          dragAttributes={attributes}
          dragListeners={listeners}
        />
      ) : (
        <p>Unknown Widget ({id})</p>
      )}
    </div>
  )
}
