import React, {
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useRef,
} from "react"
import styled from "styled-components"
import { Block, BlockType } from "./types"

const DescStyle = styled.textarea<{ bottomPadding: boolean }>`
  text-indent: 1em;
  background-color: transparent;
  border: none;
  outline: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
  resize: none;

  //transition: height 0.1s ease; 눈물을 머금고 포기
  overflow-y: hidden;

  margin: 0 0;
  padding: ${(props) => (props.bottomPadding ? "8px 0 26px" : "8px 0")};

  width: 100%;

  font-style: normal;
  font-weight: 50;
  font-size: 18px;
  line-height: 34px;
  text-align: justify;

  font-family: "KoPubWorldBatang", "Noto Serif KR", serif; // "KoPubWorldBatang"
  color: #ffffff;

  @media (max-width: 1000px) {
    font-size: 16px;
  }
`

// background-color: ${(props) =>
//     props.blockType === BlockType.Script
//       ? "olivedrab"
//       : "royalblue"}; // for test

export interface ContentBlockMoveEvent {
  currentId: string
  caretPos: number
  direction: -1 | 1
}

export interface AddBlockEvent {
  currentId: string
  defaultContent?: string
}

export interface DeleteBlockEvent {
  currentId: string
}

const ContentBlock: React.FC<{
  block: Block
  autoFocus?: boolean
  focusPos?: number

  onChange(block: Block): Promise<void>
  // Enter 등으로 새로운 블럭 생성
  onAddBlock(event: AddBlockEvent): Promise<void>
  // Backspace 등으로 현재 블록 삭제
  onDeleteBlock(event: DeleteBlockEvent): Promise<void>
  // 방향키로 블록 이동
  onMoveFocus(event: ContentBlockMoveEvent): Promise<void>
  bottomPadding: boolean
}> = ({
  block,
  autoFocus,
  focusPos,
  onAddBlock,
  onChange,
  onDeleteBlock,
  onMoveFocus,
  bottomPadding = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [content, setContent] = React.useState(
    block.blockType === BlockType.Script ? `“${block.content}”` : block.content
  )
  const [blockType, setBlockType] = React.useState(block.blockType)

  const _onChange = () => {
    setContent(textareaRef.current?.value || "")
    handleResizeHeight()
  }

  const handleResizeHeight = useCallback(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = "1px"
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
  }, [])

  // 처음 생겼을 때 이벤트
  useEffect(() => {
    console.log("Created!", block.id)
    handleResizeHeight()
    if (autoFocus) {
      console.log("autoFocus", block.id, focusPos)
      textareaRef.current?.focus()
      if (focusPos !== undefined)
        textareaRef.current?.setSelectionRange(focusPos, focusPos)
    }
  }, [])

  useEffect(() => {
    console.log("Block Type Updated!", block.id)
    if (content === "“”") textareaRef.current?.setSelectionRange(1, 1)
    handleResizeHeight()
  }, [blockType])

  // content가 바뀔 때의 이벤트
  useEffect(() => {
    const _content = content
      .replace(/--/g, "—")
      .replace(/->/g, "→")
      .replace(/=>/g, "⇒")
      .replace("...", "…")
      .replace(/^["“”](.*)["“”]$/, "“$1”")

    setContent(_content)
    onChange({ ...block, blockType: blockType, content: content }).then()
    setBlockType(
      _content.startsWith("“") && _content.endsWith("”")
        ? BlockType.Script
        : BlockType.Description
    )
  }, [content])

  // autoFocus 바뀔 떄의 이벤트
  useEffect(() => {
    console.log("Focus Me!", block.id)
    if (autoFocus) textareaRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    console.log("Focus Pos!", block.id, focusPos)
    if (focusPos !== undefined)
      textareaRef.current?.setSelectionRange(focusPos, focusPos)
  }, [focusPos])

  const onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    console.log(e.key)

    // 블록의 추가와 삭제
    if (e.key === "Enter" && !e.shiftKey) {
      // 엔터 키를 눌렀을 때 (새로운 블록 추가)
      e.preventDefault()
      if (!content) return
      return onAddBlock({ currentId: block.id }).then()
    } else if (e.key === "Backspace" && content === "") {
      // 컨텐츠가 빈 상태에서 백스페이스 키를 눌렀을 때 (블록 삭제)
      e.preventDefault()
      return onDeleteBlock({ currentId: block.id }).then()
    }

    // 블록 타입 변경
    if (e.shiftKey && e.key === '"' && !content) {
      e.preventDefault()
      setContent("“”")
      setBlockType(BlockType.Script)
    }

    // 선택 상태에서는 이동하지 않음
    if (
      textareaRef.current?.selectionEnd !== textareaRef.current?.selectionStart
    )
      return

    // 방향키를 통한 커서 이동
    if (e.key === "ArrowLeft" && textareaRef.current?.selectionStart === 0) {
      // 커서가 맨 앞에 있을 때 왼쪽 방향키를 눌렀을 때 (이전 블록으로 이동)
      return onMoveFocus({
        currentId: block.id,
        caretPos: 9999,
        direction: -1,
      }).then()
    } else if (
      e.key === "ArrowRight" &&
      textareaRef.current?.selectionStart === content.length
    ) {
      // 커서가 맨 뒤에 있을 때 오른쪽 방향키를 눌렀을 때 (다음 블록으로 이동)
      return onMoveFocus({
        currentId: block.id,
        caretPos: 0,
        direction: 1,
      }).then()
    } else if (
      e.key === "ArrowUp" &&
      !content.slice(0, textareaRef.current?.selectionStart).includes("\n")
    ) {
      return onMoveFocus({
        currentId: block.id,
        caretPos: textareaRef.current?.selectionStart || 9999,
        direction: -1,
      }).then()
    } else if (
      e.key === "ArrowDown" &&
      !content.slice(textareaRef.current?.selectionStart).includes("\n")
    ) {
      return onMoveFocus({
        currentId: block.id,
        caretPos: textareaRef.current?.selectionStart || 0,
        direction: 1,
      }).then()
    }
  }

  return (
    <DescStyle
      ref={textareaRef}
      onChange={_onChange}
      value={content}
      onKeyDown={onKeyDown}
      rows={1}
      bottomPadding
      placeholder="내용을 입력하세요."
    />
  )
}

export default ContentBlock
