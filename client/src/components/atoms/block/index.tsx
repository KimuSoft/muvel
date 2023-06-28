import React, { useContext, useRef } from "react"
import { ContentEditableEvent } from "react-contenteditable"
import { StyledContentEditable } from "./styles"
import styled from "styled-components"
import EditorContext from "../../../context/EditorContext"
import stringToBlock from "../../../utils/stringToBlock"
import { SortableElement, SortableHandle } from "react-sortable-hoc"
import BlockHandle from "../BlockHandle"
import { Block, BlockType } from "../../../types/block.type"
import { Menu, MenuButton, MenuItem, MenuList, Portal } from "@chakra-ui/react"
import { AiFillFileAdd } from "react-icons/all"
// import keySoundFile from "./keySound.mp3"
// import { Howl } from "howler"

// const keySound = new Howl({ src: keySoundFile })

const DragHandle = SortableHandle<{ blockType: BlockType }>(
  ({ blockType, onClick }: { blockType: BlockType; onClick(): void }) => (
    <BlockHandle blockType={blockType} onClick={onClick} />
  )
)

// 좌우 정렬
const BlockContainer = styled.li`
  list-style: none;
  padding: 0;
  margin: 0;

  &:hover .block-handle {
    opacity: 1;
  }
`

const Relative = styled.div`
  position: relative;
  right: 40px;
`

export const SortableBlock = SortableElement<BlockProps>(
  (props: BlockProps) => (
    <BlockContainer>
      <Relative>
        <DragHandle blockType={props.block.blockType} />
      </Relative>

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

const DividerContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Divider = styled.div`
  width: 60%;
  height: 1px;

  background-color: #52525b;

  margin-top: 80px;
  margin-bottom: 100px;
`

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

const BlockComponent: React.FC<BlockProps> = ({
  block,
  addBlock,
  deleteBlock,
  updateBlock,
  position,
  moveToRelativeBlock,
}) => {
  // Ctrl + V 기능 전용으로 사용
  const { blocks, setBlocks } = useContext(EditorContext)

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
    else if (e.key === "ArrowUp" && !e.shiftKey) {
      e.preventDefault()
      moveToRelativeBlock?.(position, -1, true)
    }

    // 아무 곳에서나 아래 방향키를 누르면 아래 블록으로 이동
    else if (e.key === "ArrowDown" && !e.shiftKey) {
      e.preventDefault()
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
  }

  return (
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
  )
}

export default BlockComponent
