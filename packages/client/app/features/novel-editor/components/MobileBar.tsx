import { useEffect, useState } from "react"
import { Box, Button, HStack, Spacer } from "@chakra-ui/react"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"
import { TextSelection } from "prosemirror-state"

const MobileBar = () => {
  const { view } = useEditorContext()
  const [bottomOffset, setBottomOffset] = useState(0)
  // 키보드 표시 여부를 추적하는 상태 추가
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

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
        gap={0}
        bgColor={{ base: "white", _dark: "black" }}
        // 보이지 않을 때 상호작용 막기 (선택 사항)
        pointerEvents={isKeyboardVisible ? "auto" : "none"}
      >
        {/* 버튼들은 그대로 유지 */}
        <Button size={"sm"} variant={"ghost"} onClick={() => insertSymbol("!")}>
          !
        </Button>
        <Button size={"sm"} variant={"ghost"} onClick={() => insertSymbol("?")}>
          ?
        </Button>
        <Button size={"sm"} variant={"ghost"} onClick={() => insertSymbol("-")}>
          -
        </Button>
        <Button size={"sm"} variant={"ghost"} onClick={() => insertSymbol("~")}>
          ~
        </Button>
        <Button size={"sm"} variant={"ghost"} onClick={() => insertSymbol("—")}>
          —
        </Button>
        <Spacer />
        <Button size={"sm"} variant={"ghost"} onClick={() => insertSymbol("⋯")}>
          ⋯
        </Button>
        <Button
          size={"sm"}
          variant={"ghost"}
          onClick={() => insertSymbolPair("‘", "’")}
        >
          ‘’
        </Button>
        <Button
          size={"sm"}
          variant={"ghost"}
          onClick={() => insertSymbolPair("“", "”")}
        >
          “”
        </Button>
      </HStack>
    </Box>
  )
}

export default MobileBar
