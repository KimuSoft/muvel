import React, {
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useRef,
} from "react"
import styled from "styled-components"
import { Block, BlockType } from "../../types"

interface BlockStyleProps {
  blockType: BlockType
}

const DescStyle = styled.textarea<BlockStyleProps>`
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
  padding: ${(props) =>
    props.blockType === BlockType.Script ? "26px 0" : "8px 0"};

  width: 100%;

  font-style: normal;
  font-weight: 50;
  font-size: 16px;
  line-height: 30px;

  font-family: "KoPubWorldBatang", "Noto Serif KR", serif; // "KoPubWorldBatang"
  color: #ffffff;
`

// background-color: ${(props) =>
//     props.blockType === BlockType.Script
//       ? "olivedrab"
//       : "royalblue"}; // for test

const ContentBlock: React.FC<{
  block: Block
  isNew?: boolean
  onEnter(id: string): Promise<void>
  onChange(block: Block): Promise<void>
  onDelete(id: string): Promise<void>
  onMovePrev(id: string): Promise<void>
  onMoveNext(id: string): Promise<void>
}> = ({
  block,
  isNew,
  onEnter,
  onChange,
  onDelete,
  onMovePrev,
  onMoveNext,
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

  const _onEnter = () => onEnter(block.id).then()

  // 처음 생겼을 때 이벤트
  useEffect(() => {
    console.log("Created!", block.id)
    handleResizeHeight()
    if (isNew) textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    if (content === "“”") {
      textareaRef.current?.setSelectionRange(1, 1)
    }
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

  // isNew가 바뀔 떄의 이벤트
  useEffect(() => {
    console.log("Updated to Focus!", block.id)
    if (isNew) textareaRef.current?.focus()
  }, [isNew])

  const onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    console.log(e.key)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!content) return
      _onEnter().then()
    } else if (e.key === "Backspace" && content === "") {
      e.preventDefault()
      onDelete(block.id).then()
    } else if (
      e.key === "ArrowLeft" &&
      textareaRef.current?.selectionStart === 0
    ) {
      onMovePrev(block.id).then()
    } else if (
      e.key === "ArrowRight" &&
      textareaRef.current?.selectionStart === content.length
    ) {
      onMoveNext(block.id).then()
    } else if (e.shiftKey && e.key === '"' && !content) {
      e.preventDefault()
      setContent("“”")
      setBlockType(BlockType.Script)
    }
  }

  return (
    <DescStyle
      ref={textareaRef}
      onChange={_onChange}
      value={content}
      onKeyDown={onKeyDown}
      rows={1}
      autoFocus
      blockType={blockType}
      placeholder="내용을 입력하세요."
    />
  )
}
export default ContentBlock
