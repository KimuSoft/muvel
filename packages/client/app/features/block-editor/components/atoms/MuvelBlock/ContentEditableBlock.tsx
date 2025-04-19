import ContentEditable, {
  type ContentEditableEvent,
} from "react-contenteditable"
import React, { useEffect, useMemo, useRef } from "react"
import { type LegacyBlock, LegacyBlockType } from "muvel-api-types"
import "./block.css"
import { useBlockEditor } from "~/features/block-editor/context/EditorContext"
import { useOption } from "~/context/OptionContext"
import { useColorMode } from "~/components/ui/color-mode"
import stringToBlock from "~/features/block-editor/utils/stringToBlock"

const ContentEditableBlock: React.FC<BlockContentEditableProps> = ({
  block,
  addBlock,
  deleteBlock,
  updateBlock,
  position,
  moveToRelativeBlock,
  disabled = false,
}) => {
  // Ctrl + V 기능 전용으로 사용
  const { blocks, updateBlocks } = useBlockEditor()
  const [option] = useOption()

  const contenteditable = useRef<HTMLElement>(null!)
  const content = useRef<string>(block.content)
  const contentWithoutHtmlTags = useRef<string>(block.content)

  const { colorMode } = useColorMode()

  const style = useMemo(() => {
    switch (block.blockType) {
      case LegacyBlockType.Comment:
        return {
          color: "var(--chakra-colors-gray-500)",
          backgroundColor:
            colorMode === "light"
              ? "var(--chakra-colors-gray-100)"
              : "var(--chakra-colors-gray-800)",
        }
      default:
        return {
          padding: `${option.gap / 2}px 0`,
          fontSize: option.fontSize + "px",
          lineHeight: option.lineHeight + "px",
          textIndent: option.indent + "em",
          color:
            colorMode === "light"
              ? "var(--chakra-colors-gray-700)"
              : "var(--chakra-colors-gray-300)",
          fontWeight: colorMode === "light" ? 500 : 50,
        }
    }
  }, [option, colorMode, block.blockType])

  useEffect(() => {
    if (!contenteditable.current || block.content === content.current) return

    contenteditable.current.innerHTML = block.content
    content.current = block.content
  }, [block.blockType])

  // 외부에서 수정된 경우
  useEffect(() => {
    if (block.content === contentWithoutHtmlTags.current) return

    console.log(
      "외부 수정 감지!",
      `'${block.content}'`,
      `'${contentWithoutHtmlTags.current}'`,
    )
    content.current = block.content

    if (!contenteditable.current) return
    contenteditable.current.innerText = block.content
  }, [block.content])

  const getBlockType = (content: string): LegacyBlockType => {
    if (block.blockType === LegacyBlockType.Comment)
      return LegacyBlockType.Comment

    if (content.startsWith("“") && content.endsWith("”")) {
      return LegacyBlockType.DoubleQuote
    } else if (content.startsWith("‘") && content.endsWith("’")) {
      return LegacyBlockType.SingleQuote
    } else {
      return LegacyBlockType.Describe
    }
  }

  const handleChange = (e: ContentEditableEvent) => {
    content.current = e.target.value

    const value = (e.currentTarget as HTMLDivElement).innerText.trim()
    contentWithoutHtmlTags.current = value

    if (!value) content.current = value

    const blockType = getBlockType(value)
    updateBlock?.({ id: block.id, blockType, content: value })
  }

  const pasteHandler = (e: ClipboardEvent) => {
    const text = e.clipboardData?.getData("text/plain") || ""
    if (!text.includes("\n")) return

    // Ctrl + V를 누르면 블록으로 붙여넣음
    e.preventDefault()

    updateBlocks(() => [
      ...blocks.slice(0, position + 1),
      ...stringToBlock(text),
      ...blocks.slice(position + 1),
    ])
  }

  const subscribedKeys = [
    "Enter",
    "Backspace",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "/",
    '"',
    "-",
  ]

  const keyDownHandler = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!subscribedKeys.includes(e.key)) return

    // 주의: contentWithoutHtmlTags.current 는 키 이벤트가 발생하기 이전의 값을 보여주므로 주의!

    // 새로운 블록 생성
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!contentWithoutHtmlTags.current) return
      return addBlock?.(block.id)
    }

    // 주의: 이 뒤에서는 e.preventDefault()가 정상적으로 작동하지 않는 듯함
    const beforeCaret = document.getSelection()?.anchorOffset
    await new Promise((res) => setTimeout(res, 0))
    const afterCaret = document.getSelection()?.anchorOffset

    // 내용이 없는 상태에서 백스페이스를 누르면 블록 삭제
    if (
      e.key === "Backspace" &&
      !contentWithoutHtmlTags.current &&
      beforeCaret !== 1
    ) {
      // 첫 번째 블록이면 무시
      moveToRelativeBlock?.(position, -1, false)
      deleteBlock?.({ id: block.id })
    }

    // 캐럿이 0에 있고, 앞 방향키를 누르면 앞 블록으로 이동
    else if (
      e.key === "ArrowLeft" &&
      beforeCaret === afterCaret &&
      !e.shiftKey
    ) {
      console.log("좌이동")
      moveToRelativeBlock?.(position, -1, false)
    }

    // 캐럿이 마지막에 있고, 뒤 방향키를 누르면 뒤 블록으로 이동
    else if (
      e.key === "ArrowRight" &&
      beforeCaret === afterCaret &&
      !e.shiftKey
    ) {
      moveToRelativeBlock?.(position, 1, false)
    }

    // 아무 곳에서나 위 방향키를 누르면 위 블록으로 이동
    else if (e.key === "ArrowUp" && !e.shiftKey && !afterCaret && position) {
      if (beforeCaret === undefined) return console.warn("beforeCaret is null")
      // 캐럿 위치를 원래대로 복구함
      if (content.current) {
        const range = document.createRange()
        const sel = window.getSelection()
        range.setStart(contenteditable.current?.childNodes[0]!, beforeCaret)
        range.collapse(true)
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
      moveToRelativeBlock?.(position, -1, true)
    }

    // 아무 곳에서나 아래 방향키를 누르면 아래 블록으로 이동
    else if (
      e.key === "ArrowDown" &&
      !e.shiftKey &&
      afterCaret === content.current.length
    ) {
      if (beforeCaret === undefined) return console.warn("beforeCaret is null")
      // 캐럿 위치를 원래대로 복구함
      if (content.current) {
        const range = document.createRange()
        const sel = window.getSelection()
        range.setStart(contenteditable.current?.childNodes[0]!, beforeCaret)
        range.collapse(true)
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
      moveToRelativeBlock?.(position, 1, true)
    }

    // 구분선 블록 생성
    else if (e.key === "-" && content.current === "---") {
      updateBlocks((b) =>
        b.map((bl) => ({
          ...bl,
          ...(bl.id === block.id && { blockType: LegacyBlockType.Divider }),
        })),
      )
      addBlock?.(block.id)
      moveToRelativeBlock?.(position, 1, false)
    }
    // 쌍따옴표 블록 생성
    else if (e.key === '"' && content.current === '"') {
      console.log("쌍따옴표 블록 생성")
      e.preventDefault()
      if (!contenteditable.current) return
      contenteditable.current.innerText = "“”"

      // set caret to 1
      const range = document.createRange()
      const sel = window.getSelection()
      range.setStart(contenteditable.current.childNodes[0], 1)
      range.collapse(true)
      sel?.removeAllRanges()
      sel?.addRange(range)
      contenteditable.current.focus()
    }

    // 주석 블록 생성
    else if (e.key === "/" && content.current === "//") {
      console.log("주석 블록 생성")
      e.preventDefault()
      if (!contenteditable.current) return
      contenteditable.current.innerText = ""

      updateBlocks((b) =>
        b.map((bl) => ({
          ...bl,
          ...(bl.id === block.id && {
            blockType: LegacyBlockType.Comment,
            content: "",
          }),
        })),
      )
    }
  }

  return (
    <ContentEditable
      key={"block-contenteditable-" + block.id}
      className={`block data_position_${position} ${
        block.blockType === LegacyBlockType.Comment ? "comment-block" : ""
      }`}
      innerRef={contenteditable}
      onChange={handleChange}
      onKeyDown={keyDownHandler}
      // @ts-ignore
      onPaste={pasteHandler}
      html={content.current}
      placeholder={"내용을 입력해 주세요."}
      style={style}
      disabled={disabled}
    />
  )
}

export interface BlockContentEditableProps {
  block: LegacyBlock
  position: number
  addBlock?: (blockId: string) => void
  deleteBlock?: ({ id }: { id: string }) => void
  updateBlock?: (block: LegacyBlock) => void
  moveToRelativeBlock?: (
    currentPos: number,
    direction: -1 | 1,
    preserveCaretPosition: boolean,
  ) => void
  disabled?: boolean
}

export default ContentEditableBlock
