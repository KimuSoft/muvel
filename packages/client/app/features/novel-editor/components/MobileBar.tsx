import { useEffect, useState } from "react"
import { Button, HStack, Spacer } from "@chakra-ui/react"
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

  // 동적으로 display 스타일 결정
  // base (모바일): isKeyboardVisible이 true일 때만 'flex'
  // md (데스크탑): 항상 'none'
  const displayStyle = {
    base: isKeyboardVisible ? "flex" : "none",
    md: "none",
  }

  return (
    <HStack
      position="sticky"
      left={0}
      right={0}
      // bottom 오프셋은 키보드 높이에 맞게 계속 조절
      bottom={0}
      borderTopWidth={1}
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      p={1}
      gap={0}
      zIndex={999}
      // 계산된 display 스타일 적용
      display={displayStyle}
      bgColor={{ base: "white", _dark: "black" }}
      // 키보드가 올라올 때 부드러운 전환 효과 (선택 사항)
      transition="bottom 0.2s ease-out, opacity 0.2s ease-out"
      // 키보드가 보이지 않을 때 투명하게 처리하여 깜빡임 방지 (선택 사항)
      opacity={isKeyboardVisible ? 1 : 0}
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
  )
}

export default MobileBar
