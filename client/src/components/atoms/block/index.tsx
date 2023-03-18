import React, { useContext, useRef, useState } from "react"
import { ContentEditableEvent } from "react-contenteditable"
import { StyledContentEditable } from "./styles"
import keySoundFile from "./keySound.mp3"
import styled from "styled-components"
import { Howl } from "howler"
import { BlockType, PartialBlock } from "../../../types/block.type"
import EditorContext from "../../../context/EditorContext"
import stringToBlock from "../../../utils/stringToBlock"
import { SortableElement, SortableHandle } from "react-sortable-hoc"
import BlockHandle from "../BlockHandle"

const keySound = new Howl({ src: keySoundFile })

const DragHandle = SortableHandle<{ blockType: BlockType }>(
  ({ blockType }: { blockType: BlockType }) => (
    <BlockHandle blockType={blockType} />
  )
)

// 좌우 정렬
const BlockContainer = styled.li`
  list-style: none;
  display: flex;
  flex-direction: row;
  padding: 0;
  margin: 0;
  gap: 10px;

  &:hover .block-handle {
    opacity: 1;
  }
`

export const SortableBlock = SortableElement<BlockProps>(
  (props: BlockProps) => (
    <BlockContainer>
      <DragHandle blockType={props.block.blockType} />
      <Block {...props} />
    </BlockContainer>
  )
)

interface BlockProps {
  block: PartialBlock
  position: number
  addBlock?: (block: PartialBlock) => void
  deleteBlock?: ({ id }: { id: string }) => void
  updateBlock?: (block: PartialBlock) => void
  moveToRelativeBlock?: (
    currentPos: number,
    direction: -1 | 1,
    preserveCaretPosition: boolean
  ) => void
  bottomSpacing: boolean
}

const Block: React.FC<BlockProps> = ({
  block,
  addBlock,
  deleteBlock,
  updateBlock,
  position,
  moveToRelativeBlock,
  bottomSpacing,
}) => {
  // Ctrl + V 기능 전용으로 사용
  const { setEpisode } = useContext(EditorContext)

  const [blockType, setBlockType] = useState<BlockType>(block.blockType)

  const contenteditable = useRef<HTMLDivElement>(null)
  const content = useRef<string>(block.content)
  const contentWithoutHtmlTags = useRef<string>(block.content)

  const getBlockType = (content: string): BlockType => {
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

    setBlockType(getBlockType(value))
    content.current = e.target.value
    contentWithoutHtmlTags.current = value

    if (!value) {
      content.current = value
    }

    updateBlock?.({ id: block.id, blockType, content: value })
  }

  const pasteHandler = (e: ClipboardEvent) => {
    const text = e.clipboardData?.getData("text/plain") || ""
    if (!text.includes("\n")) return

    // Ctrl + V를 누르면 블록으로 붙여넣음
    e.preventDefault()

    setEpisode((e) => {
      return {
        ...e,
        blocks: [
          ...e.blocks.slice(0, position + 1),
          ...stringToBlock(text),
          ...e.blocks.slice(position + 1),
        ],
      }
    })
  }

  const keyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 타자 효과음
    // keySound.play()

    // 새로운 블록 생성
    if (e.key === "Enter") {
      e.preventDefault()
      if (!contentWithoutHtmlTags.current) return
      addBlock?.(block)
    }

    // 내용이 없는 상태에서 백스페이스를 누르면 블록 삭제
    else if (e.key === "Backspace" && !contentWithoutHtmlTags.current) {
      // 첫 번째 블록이면 무시
      e.preventDefault()
      moveToRelativeBlock?.(position, -1, false)
      deleteBlock?.({ id: block.id })
    }

    // 캐럿이 0에 있고, 앞 방향키를 누르면 앞 블록으로 이동
    else if (
      e.key === "ArrowLeft" &&
      document.getSelection()?.anchorOffset === 0
    ) {
      e.preventDefault()
      moveToRelativeBlock?.(position, -1, false)
    }

    // 캐럿이 마지막에 있고, 뒤 방향키를 누르면 뒤 블록으로 이동
    else if (
      e.key === "ArrowRight" &&
      content.current.length === document.getSelection()?.anchorOffset
    ) {
      e.preventDefault()
      moveToRelativeBlock?.(position, 1, false)
    }

    // 아무 곳에서나 위 방향키를 누르면 위 블록으로 이동
    else if (e.key === "ArrowUp") {
      e.preventDefault()
      moveToRelativeBlock?.(position, -1, true)
    }

    // 아무 곳에서나 아래 방향키를 누르면 아래 블록으로 이동
    else if (e.key === "ArrowDown") {
      e.preventDefault()
      moveToRelativeBlock?.(position, 1, true)
    }

    // 쌍따옴표 블록 생성
    else if (e.key === '"' && content.current === "") {
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
  }

  return (
    /*<TypeMark blockType={blockType} />*/
    <>
      <StyledContentEditable
        innerRef={contenteditable}
        onChange={handleChange}
        onKeyDown={keyDownHandler}
        // @ts-ignore
        onPaste={pasteHandler}
        html={content.current}
        data-position={position}
        placeholder={"내용을 입력해 주세요."}
      />
      <PaddingBlock height={bottomSpacing ? 20 : 0} />
    </>
  )
}

export const PaddingBlock = styled.div<{ height: number }>`
  height: ${({ height }) => height}px;
  transition: height 0.5s ease;
`

export default Block
