// app/features/novel-editor/widgets/components/SelectionPositionWidget.tsx
import React, { useCallback, useEffect, useState } from "react"
import { HStack, Icon, Text } from "@chakra-ui/react"
import { MdMyLocation } from "react-icons/md"
import {
  WidgetBase,
  WidgetHeader,
  WidgetTitle,
} from "~/features/novel-editor/widgets/containers/WidgetBase"
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"
import { useDebouncedCallback } from "use-debounce"

const DEBOUNCE_DELAY = 100
const MAX_WAIT_DELAY = 300

export const SelectionPositionWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  const { view } = useEditorContext()
  const [positionText, setPositionText] = useState<string>("선택 없음")

  const updatePosition = useCallback(() => {
    if (!view) {
      setPositionText("선택 없음")
      return
    }

    const { selection } = view.state
    const { $from, $to, $anchor, empty } = selection

    if (empty) {
      const blockIndex = $anchor.index(0) + 1
      const offsetInBlock = $anchor.parentOffset
      setPositionText(`${blockIndex}줄 ${offsetInBlock}번째 글자`)
    } else {
      const fromBlockIndex = $from.index(0) + 1
      const fromOffsetInBlock = $from.parentOffset
      const toBlockIndex = $to.index(0) + 1
      const toOffsetInBlock = $to.parentOffset

      if (fromBlockIndex === toBlockIndex) {
        setPositionText(
          `${fromBlockIndex}줄 ${fromOffsetInBlock}~${toOffsetInBlock}번째 글자`,
        )
      } else {
        setPositionText(
          `${fromBlockIndex}줄 ${fromOffsetInBlock}번째 ~ ${toBlockIndex}줄 ${toOffsetInBlock}번째 글자`,
        )
      }
    }
  }, [view])

  const debouncedUpdatePosition = useDebouncedCallback(
    updatePosition,
    DEBOUNCE_DELAY,
    { maxWait: MAX_WAIT_DELAY },
  )

  useEffect(() => {
    if (view) {
      debouncedUpdatePosition()
    }
    return () => {
      debouncedUpdatePosition.cancel()
    }
  }, [view, view?.state?.selection, debouncedUpdatePosition])

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
