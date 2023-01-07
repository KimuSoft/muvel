import React, { useRef } from "react"
import { ContentEditableEvent } from "react-contenteditable"
import { IBlock } from "../../types"
import { StyledContentEditable } from "./styles"

const Block: React.FC<{
  block: IBlock
  position: number
  addBlock?: (block: IBlock) => void
  deleteBlock?: ({ id }: { id: string }) => void
  updateBlock?: (block: IBlock) => void
}> = ({ block, addBlock, deleteBlock, updateBlock, position }) => {
  const contenteditable = useRef<HTMLDivElement>(null)
  const content = useRef<string>(block.content)

  const handleChange = (e: ContentEditableEvent) => {
    content.current = e.target.value
    updateBlock?.({ ...block, content: e.target.value })
  }

  const keyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 새로운 블록 생성
    if (e.key === "Enter") {
      e.preventDefault()
      if (!content.current) return
      addBlock?.(block)
    }

    // 캐럿이 0에 있는 경우 백스페이스를 누르면 블록 삭제
    else if (e.key === "Backspace" && !content.current) {
      // 첫 번째 블록이면 무시
      e.preventDefault()
      deleteBlock?.({ id: block.id })
    }
  }

  return (
    <StyledContentEditable
      innerRef={contenteditable}
      onChange={handleChange}
      data-position={position}
      onKeyDown={keyDownHandler}
      html={content.current}
      blockType={block.blockType}
      bottomSpacing={false}
    />
  )
}

export default Block
