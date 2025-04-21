import { useEffect, useState } from "react"
import { Button, HStack, Spacer } from "@chakra-ui/react"
import { useEditorContext } from "~/features/editor/context/EditorContext"
import { TextSelection } from "prosemirror-state"

const MobileBar = () => {
  const { view } = useEditorContext()
  const [bottomOffset, setBottomOffset] = useState(0)

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

    // 트랜잭션: 왼쪽+오른쪽 기호 삽입
    const tr = state.tr.insertText(`${left}${right}`, from, to)

    // 커서를 왼쪽 기호와 오른쪽 기호 사이로 이동
    tr.setSelection(TextSelection.create(tr.doc, from + left.length))

    dispatch(tr)
    view.focus()
  }

  useEffect(() => {
    const updateOffset = () => {
      if (window.visualViewport) {
        const { height, offsetTop } = window.visualViewport
        const offset = window.innerHeight - height - offsetTop
        setBottomOffset(offset > 0 ? offset : 0)
      }
    }

    updateOffset()

    window.visualViewport?.addEventListener("resize", updateOffset)
    window.visualViewport?.addEventListener("scroll", updateOffset)

    return () => {
      window.visualViewport?.removeEventListener("resize", updateOffset)
      window.visualViewport?.removeEventListener("scroll", updateOffset)
    }
  }, [])

  return (
    <HStack
      position="fixed"
      left={0}
      right={0}
      bottom={`${bottomOffset}px`}
      borderTopWidth={1}
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      p={1}
      gap={0}
      zIndex={999}
      display={{ base: "flex", md: "none" }}
      bgColor={{ base: "white", _dark: "black" }}
    >
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
