// app/features/novel-editor/widgets/components/SelectionPositionWidget.tsx
import React, { useCallback, useEffect, useRef, useState } from "react"
import { HStack, Icon, Text } from "@chakra-ui/react"
import { MdMyLocation } from "react-icons/md"
import {
  WidgetBase,
  WidgetHeader,
  WidgetTitle,
} from "~/features/novel-editor/widgets/containers/WidgetBase"
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"

const THROTTLE_DELAY = 50

export const SelectionPositionWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  const { view } = useEditorContext()
  const [positionText, setPositionText] = useState<string>("선택 없음")
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const updatePosition = useCallback(() => {
    if (!view) {
      setPositionText("선택 없음")
      return
    }

    const { selection } = view.state
    const { $from, $to, $anchor, empty } = selection // $from, $to, empty 추가

    if (empty) {
      // 선택 영역이 없을 때 (커서만 있을 때)
      const blockIndex = $anchor.index(0) + 1
      const offsetInBlock = $anchor.parentOffset
      setPositionText(`${blockIndex}줄 ${offsetInBlock}번째 글자`)
    } else {
      // 선택 영역이 있을 때
      const fromBlockIndex = $from.index(0) + 1
      const fromOffsetInBlock = $from.parentOffset
      const toBlockIndex = $to.index(0) + 1
      const toOffsetInBlock = $to.parentOffset

      if (fromBlockIndex === toBlockIndex) {
        // 같은 블록 내에서 선택
        setPositionText(
          `${fromBlockIndex}줄 ${fromOffsetInBlock}~${toOffsetInBlock}번째 글자`,
        )
      } else {
        // 여러 블록에 걸쳐 선택
        setPositionText(
          `${fromBlockIndex}줄 ${fromOffsetInBlock}번째 ~ ${toBlockIndex}줄 ${toOffsetInBlock}번째 글자`,
        )
      }
    }
  }, [view])

  const throttledUpdatePosition = useCallback(() => {
    if (!throttleTimeoutRef.current) {
      updatePosition()
      throttleTimeoutRef.current = setTimeout(() => {
        throttleTimeoutRef.current = null
      }, THROTTLE_DELAY)
    }
  }, [updatePosition])

  useEffect(() => {
    if (view) {
      throttledUpdatePosition()
    }
    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current)
        throttleTimeoutRef.current = null
      }
    }
  }, [view, view?.state?.selection, throttledUpdatePosition])

  return (
    <WidgetBase>
      <WidgetHeader {...dragAttributes} {...dragListeners}>
        <HStack flex="1" cursor="grab">
          <Icon as={MdMyLocation} />
          <WidgetTitle>선택 위치</WidgetTitle>
        </HStack>
        <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
          {positionText}
        </Text>
      </WidgetHeader>
    </WidgetBase>
  )
}
