import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Box, Button, HStack, Spacer, Text } from "@chakra-ui/react"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"
import { TextSelection } from "prosemirror-state"
import { useWidgetOption } from "~/features/novel-editor/widgets/context/WidgetContext"
import type { CharCountWidgetOptions } from "~/features/novel-editor/components/dialogs/CharCountSettingDialog"
import {
  CHAR_COUNT_WIDGET_ID,
  defaultCharCountOptions,
} from "~/features/novel-editor/widgets/components/CharCountWidget"
import {
  type CountOptions,
  countTextLength,
  CountUnit,
} from "../utils/countTextLength"

const THROTTLE_DELAY_MOBILE_BAR = 250

const MobileBar = () => {
  const { view } = useEditorContext()
  const [bottomOffset, setBottomOffset] = useState(0)
  // 키보드 표시 여부를 추적하는 상태 추가
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [contentLength, setContentLength] = React.useState(0)
  // const [openMore, setOpenMore] = React.useState(false)

  const unitSuffix: Record<CountUnit, string> = {
    [CountUnit.Char]: "자",
    [CountUnit.Word]: "단어",
    [CountUnit.Sentence]: "문장",
    [CountUnit.KB]: "KB",
  }

  const [countOptions] = useWidgetOption<CharCountWidgetOptions>(
    CHAR_COUNT_WIDGET_ID,
    defaultCharCountOptions,
  )

  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Function to calculate and update content length
  const updateLength = useCallback(() => {
    if (!view) return
    const content = view.state.doc.textContent
    const len = countTextLength(content, countOptions)
    setContentLength(len)
  }, [view, countOptions]) // countOptions is memoized

  // Throttled version of updateLength, executes immediately then cools down
  const throttledUpdateLength = useCallback(() => {
    if (!throttleTimeoutRef.current) {
      updateLength() // Execute immediately
      throttleTimeoutRef.current = setTimeout(() => {
        throttleTimeoutRef.current = null // Clear ref to allow next execution
      }, THROTTLE_DELAY_MOBILE_BAR)
    }
    // If timeout is active, subsequent calls are ignored until it clears
  }, [updateLength]) // Depends on updateLength

  // Effect to listen for editor content changes and update length
  useEffect(() => {
    if (view) {
      // Initial calculation and subsequent updates on document change
      throttledUpdateLength()
    }

    // Cleanup timeout on component unmount or if dependencies change
    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current)
        throttleTimeoutRef.current = null
      }
    }
    // view.state.doc is a new object on each transaction, triggering the effect.
    // throttledUpdateLength is a stable useCallback.
  }, [view, view?.state.doc, throttledUpdateLength])
  // --- End Content Length Logic ---

  // insertSymbol 및 insertSymbolPair 함수는 동일하게 유지
  const insertSymbol = (symbol: string) => {
    if (!view) return
    const { state, dispatch } = view
    const { from, to } = state.selection
    dispatch(state.tr.insertText(symbol, from, to))
    view.focus()
  }

  const insertSymbolPair = (left: string, right: string) => {
    if (!view) return
    const { state, dispatch } = view
    const { from, to } = state.selection
    const tr = state.tr.insertText(`${left}${right}`, from, to)
    tr.setSelection(TextSelection.create(tr.doc, from + left.length))
    dispatch(tr)
    view.focus()
  }

  useEffect(() => {
    // visualViewport 지원 여부 확인
    const visualViewport = window.visualViewport
    if (!visualViewport) return

    const updateState = () => {
      const { height, offsetTop } = visualViewport
      // window.innerHeight 대신 visualViewport.height 사용
      const viewportHeight = height
      const windowHeight = window.innerHeight

      // 키보드 또는 기타 UI 요소로 인해 가려진 영역의 높이 계산
      const offset = windowHeight - viewportHeight - offsetTop
      setBottomOffset(offset > 0 ? offset : 0)

      // offset이 특정 임계값 (예: 100px)보다 크면 키보드가 활성화된 것으로 간주
      // 이 값은 필요에 따라 조절할 수 있습니다.
      const keyboardVisible = offset > 100
      setIsKeyboardVisible(keyboardVisible)
    }

    // 초기 상태 설정
    updateState()

    // 이벤트 리스너 등록
    visualViewport.addEventListener("resize", updateState)
    visualViewport.addEventListener("scroll", updateState) // 스크롤 시 offsetTop이 변경될 수 있음

    // 클린업 함수
    return () => {
      visualViewport.removeEventListener("resize", updateState)
      visualViewport.removeEventListener("scroll", updateState)
    }
  }, []) // 마운트 시 한 번만 실행

  return (
    <Box
      display={{ base: "block", md: "none" }}
      position="fixed"
      w={"100vw"}
      h={"100dvh"}
      left={0}
      bottom={bottomOffset}
      // 클릭 무시
      pointerEvents={"none"}
      zIndex={10}
    >
      <HStack
        position={"absolute"}
        w={"100%"}
        left={0}
        // bottom 오프셋은 키보드 높이에 맞게 계속 조절
        bottom={0}
        borderTopWidth={1}
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        p={1}
        px={5}
        color={"gray.500"}
        gap={2}
        bgColor={{ base: "white", _dark: "black" }}
        // 보이지 않을 때 상호작용 막기 (선택 사항)
        pointerEvents={"auto"}
      >
        <Text fontSize={"sm"}>
          {contentLength.toLocaleString()}
          {unitSuffix[countOptions.unit]}
        </Text>
        <Spacer />
        <Button
          w={"20px"}
          color={"gray.500"}
          size={"sm"}
          variant={"ghost"}
          onClick={() => insertSymbol("!")}
        >
          !
        </Button>
        <Button
          w={"20px"}
          color={"gray.500"}
          size={"sm"}
          variant={"ghost"}
          onClick={() => insertSymbol("?")}
        >
          ?
        </Button>
        <Button
          w={"20px"}
          color={"gray.500"}
          size={"sm"}
          variant={"ghost"}
          onClick={() => insertSymbol("⋯")}
        >
          ⋯
        </Button>
        <Button
          size={"sm"}
          w={"20px"}
          color={"gray.500"}
          variant={"ghost"}
          onClick={() => insertSymbolPair("‘", "’")}
        >
          ‘⋯’
        </Button>
        <Button
          size={"sm"}
          w={"20px"}
          variant={"ghost"}
          color={"gray.500"}
          onClick={() => insertSymbolPair("“", "”")}
        >
          “⋯”
        </Button>
      </HStack>
    </Box>
  )
}

export default MobileBar
