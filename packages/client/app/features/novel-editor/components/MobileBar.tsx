import React, { useCallback, useEffect, useState } from "react"
import { Box, Button, HStack, Spacer, Text } from "@chakra-ui/react"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"
import { TextSelection } from "prosemirror-state"
import type { CharCountWidgetOptions } from "~/features/novel-editor/components/dialogs/CharCountSettingDialog"
import {
  CHAR_COUNT_WIDGET_ID,
  defaultCharCountOptions,
} from "~/features/novel-editor/widgets/components/CharCountWidget"
import { countTextLength, CountUnit } from "../utils/countTextLength" // 경로 utils/countTextLength로 가정
import { useSpecificWidgetSettings } from "~/hooks/useAppOptions"
import { useDebouncedCallback } from "use-debounce" // use-debounce 임포트

const THROTTLE_DELAY_MOBILE_BAR = 250

const MobileBar = () => {
  const { view } = useEditorContext()
  // const [bottomOffset, setBottomOffset] = useState(0)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [contentLength, setContentLength] = useState(0) // React.useState 대신 useState 사용

  const unitSuffix: Record<CountUnit, string> = {
    [CountUnit.Char]: "자",
    [CountUnit.Word]: "단어",
    [CountUnit.Sentence]: "문장",
    [CountUnit.KB]: "KB",
  }

  const [countOptions] = useSpecificWidgetSettings<CharCountWidgetOptions>(
    CHAR_COUNT_WIDGET_ID,
    defaultCharCountOptions,
  )

  // Function to calculate and update content length
  const updateLength = useCallback(() => {
    if (!view) return
    const content = view.state.doc.textContent
    const len = countTextLength(content, countOptions)
    setContentLength(len)
  }, [view, countOptions])

  // useDebouncedCallback 사용
  const debouncedUpdateLength = useDebouncedCallback(
    updateLength,
    THROTTLE_DELAY_MOBILE_BAR,
    // 필요한 경우 여기에 옵션 추가: { maxWait: 1000, leading: true } 등
  )

  // Effect to listen for editor content changes and update length
  useEffect(() => {
    if (view && isKeyboardVisible) {
      // ProseMirror의 state가 변경될 때마다 debouncedUpdateLength 호출
      // view.state.doc이 변경될 때마다 이 useEffect가 다시 실행됨
      debouncedUpdateLength()
    }

    // 컴포넌트 언마운트 시 또는 의존성 변경으로 effect가 재실행되기 전에 debounce 취소
    return () => {
      debouncedUpdateLength.cancel()
    }
  }, [view, view?.state.doc, isKeyboardVisible, debouncedUpdateLength]) // isKeyboardVisible 의존성 추가

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

  // useEffect(() => {
  //   const visualViewport = window.visualViewport
  //   if (!visualViewport) return
  //
  //   const updateState = () => {
  //     const { height, offsetTop } = visualViewport
  //     const viewportHeight = height
  //     const windowHeight = window.innerHeight
  //     const offset = windowHeight - viewportHeight - offsetTop
  //     setBottomOffset(offset > 0 ? offset : 0)
  //     const keyboardVisible = offset > 100 // 임계값
  //     setIsKeyboardVisible(keyboardVisible)
  //   }
  //
  //   updateState()
  //   visualViewport.addEventListener("resize", updateState)
  //   visualViewport.addEventListener("scroll", updateState)
  //
  //   return () => {
  //     visualViewport.removeEventListener("resize", updateState)
  //     visualViewport.removeEventListener("scroll", updateState)
  //   }
  // }, [])

  return (
    <Box
      display={{ base: "block", md: "none" }}
      position="absolute"
      w={"100vw"}
      // h={"100dvh"} // 이 부분은 MobileBar 자체의 높이가 아니라, MobileBar가 화면 하단에 고정되는 방식을 결정합니다.
      // MobileBar의 실제 높이는 내부 HStack에 의해 결정됩니다.
      // 100dvh로 설정하면 MobileBar가 전체 화면을 덮는 투명 레이어가 될 수 있으므로 주의가 필요합니다.
      // 의도한 바가 키보드 높이에 따라 MobileBar의 bottom 위치를 조정하는 것이라면 현재 로직이 맞습니다.
      left={0}
      bottom={0} // 키보드 높이에 따라 bottom 위치 조정
      pointerEvents={"none"} // 전체 Box는 클릭 이벤트를 무시
      zIndex={10}
    >
      <HStack
        position={"absolute"} // 부모 Box 내에서 절대 위치
        w={"100%"}
        left={0}
        bottom={0} // 부모 Box의 하단에 정확히 붙도록 설정
        borderTopWidth={1}
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        p={1}
        px={5}
        color={"gray.500"}
        gap={2}
        bgColor={{ base: "white", _dark: "black" }}
        pointerEvents={"auto"} // HStack 내부 요소들은 클릭 가능하도록 설정
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
