import React, { useContext, useEffect, useRef, useState } from "react"
import { ContentEditableEvent } from "react-contenteditable"
import {
  BlockContainer,
  CommentBlock,
  Divider,
  DividerContainer,
  StyledContentEditable,
} from "./styles"
import EditorContext from "../../../context/EditorContext"
import stringToBlock from "../../../utils/stringToBlock"
import { SortableElement } from "react-sortable-hoc"
import { Block, BlockType } from "../../../types/block.type"
import { Box, useColorMode } from "@chakra-ui/react"
import BlockHandle from "./BlockHandle"

export const SortableBlock = SortableElement<BlockProps>(
  (props: BlockProps) => (
    <BlockContainer>
      <Box position="relative" right="40px">
        <BlockHandle block={props.block} />
      </Box>

      {props.block.blockType === BlockType.Divider ? (
        <DividerContainer>
          <Divider />
        </DividerContainer>
      ) : (
        <BlockComponent {...props} />
      )}
    </BlockContainer>
  )
)

const BlockComponent: React.FC<BlockProps> = ({
  block,
  addBlock,
  deleteBlock,
  updateBlock,
  position,
  moveToRelativeBlock,
}) => {
  // Ctrl + V 기능 전용으로 사용
  const { blocks, setBlocks, option } = useContext(EditorContext)

  const contenteditable = useRef<HTMLDivElement>(null)
  const content = useRef<string>(block.content)
  const contentWithoutHtmlTags = useRef<string>(block.content)

  const { colorMode } = useColorMode()

  useEffect(() => {
    if (!contenteditable.current || block.content === content.current) return

    contenteditable.current.innerHTML = block.content
    content.current = block.content
  }, [block.blockType])

  const getBlockType = (content: string): BlockType => {
    if (block.blockType === BlockType.Comment) return BlockType.Comment

    if (content.startsWith("“") && content.endsWith("”")) {
      return BlockType.DoubleQuote
    } else if (content.startsWith("‘") && content.endsWith("’")) {
      return BlockType.SingleQuote
    } else {
      return BlockType.Describe
    }
  }

  const handleChange = (e: ContentEditableEvent) => {
    const value = (e.currentTarget as HTMLDivElement).innerText.trim()
    const blockType = getBlockType(value)
    if (block.blockType !== blockType) console.log("바뀜!!!")

    content.current = e.target.value
    contentWithoutHtmlTags.current = value

    if (!value) content.current = value

    updateBlock?.({ id: block.id, blockType, content: value })
  }

  const pasteHandler = (e: ClipboardEvent) => {
    const text = e.clipboardData?.getData("text/plain") || ""
    if (!text.includes("\n")) return

    // Ctrl + V를 누르면 블록으로 붙여넣음
    e.preventDefault()

    setBlocks([
      ...blocks.slice(0, position + 1),
      ...stringToBlock(text),
      ...blocks.slice(position + 1),
    ])
  }

  const keyDownHandler = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 주의: contentWithoutHtmlTags.current는 키 이벤트가 발생하기 이전의 값을 보여주므로 주의!

    // 새로운 블록 생성
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!contentWithoutHtmlTags.current) return
      return addBlock?.(block)
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
      setBlocks((b) =>
        b.map((bl) => ({
          ...bl,
          ...(bl.id === block.id && { blockType: BlockType.Divider }),
        }))
      )
      addBlock?.(block)
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

      setBlocks((b) =>
        b.map((bl) => ({
          ...bl,
          ...(bl.id === block.id && { blockType: BlockType.Comment }),
        }))
      )

      // set caret to 0
      const range = document.createRange()
      const sel = window.getSelection()
      range.setStart(contenteditable.current.childNodes[0], 0)
      range.collapse(true)
      sel?.removeAllRanges()
      sel?.addRange(range)
      contenteditable.current.focus()
    }
  }

  return block.blockType === BlockType.Comment ? (
    <CommentBlock
      key={"block-contenteditable-" + block.id}
      innerRef={contenteditable}
      onChange={handleChange}
      onKeyDown={keyDownHandler}
      // @ts-ignore
      onPaste={pasteHandler}
      html={content.current}
      data-position={position}
      placeholder={"내용을 입력해 주세요."}
      color_mode={colorMode}
      editor_options={option}
    />
  ) : (
    <>
      <StyledContentEditable
        key={"block-contenteditable-" + block.id}
        innerRef={contenteditable}
        onChange={handleChange}
        onKeyDown={keyDownHandler}
        // @ts-ignore
        onPaste={pasteHandler}
        html={content.current}
        data-position={position}
        placeholder={"내용을 입력해 주세요."}
        color_mode={colorMode}
        editor_options={option}
      />
    </>
  )
}

interface BlockProps {
  block: Block
  position: number
  addBlock?: (block: Block) => void
  deleteBlock?: ({ id }: { id: string }) => void
  updateBlock?: (block: Block) => void
  moveToRelativeBlock?: (
    currentPos: number,
    direction: -1 | 1,
    preserveCaretPosition: boolean
  ) => void
}
export default BlockComponent
