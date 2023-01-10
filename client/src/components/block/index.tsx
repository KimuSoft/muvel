import React, { useRef, useState } from "react"
import { ContentEditableEvent } from "react-contenteditable"
import { BlockType, IBlock } from "../../types"
import { BlockWrapper, StyledContentEditable, TypeMark } from "./styles"
import keySound from "./keySound.mp3"
import styled from "styled-components"

const Block: React.FC<{
  block: IBlock
  position: number
  addBlock?: (block: IBlock) => void
  deleteBlock?: ({ id }: { id: string }) => void
  updateBlock?: (block: IBlock) => void
  moveToRelativeBlock?: (currentPos: number, direction: -1 | 1) => void
  bottomSpacing: boolean
}> = ({
  block,
  addBlock,
  deleteBlock,
  updateBlock,
  position,
  moveToRelativeBlock,
  bottomSpacing,
}) => {
  const [blockType, setBlockType] = useState<BlockType>(block.blockType)

  const contenteditable = useRef<HTMLDivElement>(null)
  const content = useRef<string>(block.content)

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
    setBlockType(getBlockType(e.target.value))
    content.current = e.target.value
    updateBlock?.({ id: block.id, blockType, content: e.target.value })
  }

  const keyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const audio = new Audio(keySound)
    audio.play().then()

    // 새로운 블록 생성
    if (e.key === "Enter") {
      e.preventDefault()
      if (!content.current) return
      addBlock?.(block)
    }

    // 내용이 없는 상태에서 백스페이스를 누르면 블록 삭제
    else if (e.key === "Backspace" && !content.current) {
      // 첫 번째 블록이면 무시
      e.preventDefault()
      deleteBlock?.({ id: block.id })
    }

    // 캐럿이 0에 있고, 앞 방향키를 누르면 앞 블록으로 이동
    else if (
      e.key === "ArrowLeft" &&
      document.getSelection()?.anchorOffset === 0
    ) {
      e.preventDefault()
      moveToRelativeBlock?.(position, -1)
    }

    // 캐럿이 마지막에 있고, 뒤 방향키를 누르면 뒤 블록으로 이동
    else if (
      e.key === "ArrowRight" &&
      content.current.length === document.getSelection()?.anchorOffset
    ) {
      e.preventDefault()
      moveToRelativeBlock?.(position, 1)
    }

    // 아무 곳에서나 위 방향키를 누르면 위 블록으로 이동
    else if (e.key === "ArrowUp") {
      e.preventDefault()
      moveToRelativeBlock?.(position, -1)
    }

    // 아무 곳에서나 아래 방향키를 누르면 아래 블록으로 이동
    else if (e.key === "ArrowDown") {
      e.preventDefault()
      moveToRelativeBlock?.(position, 1)
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
