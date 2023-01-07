import React, { KeyboardEventHandler, useEffect, useRef } from "react"
import styled from "styled-components"
import { Block, BlockType } from "../../deprecated/types"
import ContentEditable from "react-contenteditable"

const StyledContentEditable = styled(ContentEditable)<{
  bottomPadding: boolean
  blockType: BlockType
}>`
  text-indent: 1em;
  background-color: ${(props) =>
    props.bottomPadding ? "#447854" : "transparent"};
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

const ContentBlock: React.FC<{
  block: Block
  isNew?: boolean
  onEnter(id: string): Promise<void>
  onChange(block: Block): Promise<void>
  onDelete(id: string): Promise<void>
  onMovePrev(id: string): Promise<void>
  onMoveNext(id: string): Promise<void>
  bottomPadding: boolean
}> = ({
  block,
  isNew,
  onEnter,
  onChange,
  onDelete,
  onMovePrev,
  onMoveNext,
  bottomPadding = false,
}) => {
  const contenteditable = useRef<HTMLDivElement>(null)
  const text = useRef<string>(
    block.blockType === BlockType.Script ? `“${block.content}”` : block.content
  )

  const [blockType, setBlockType] = React.useState(block.blockType)

  const _onEnter = () => onEnter(block.id).then()

  // useEffect(() => {
  //   console.log("이벤트 등록")
  //   document.addEventListener('selectionchange', () => {
  //     console.log("이벤트 발동")
  //     if (document.activeElement !== contenteditable.current) return
  //     console.log(text, document.getSelection()?.getRangeAt(0).startOffset)
  //   })
  // }, [])

  // 처음 생겼을 때 이벤트
  // useEffect(() => {
  //   console.log("Created!", block.id)
  //   if (isNew) contenteditable.current?.focus()
  // }, [])
  //
  // useEffect(() => {
  //   if (content === "“”") contenteditable.current?.setSelectionRange(1, 1)
  // }, [blockType])

  // isNew가 바뀔 떄의 이벤트
  useEffect(() => {
    console.log("Updated to Focus!", block.id)
    if (isNew) contenteditable.current?.focus()
  }, [isNew])

  const onKeyDown: KeyboardEventHandler = (e) => {
    const caretPos = document.getSelection()?.getRangeAt(0).startOffset

    // 엔터를 누르면 새로운 블록 생성
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!text.current) return
      _onEnter().then()
    }

    // 블록에 아무 내용이 없는 상태에서 지우면 해당 블록 삭제
    else if (e.key === "Backspace" && !text.current) {
      e.preventDefault()
      onDelete(block.id).then()
    }

    // 가장 앞에 캐럿을 두고 왼쪽 화살표를 누르면 이전 블록으로 이동
    else if (e.key === "ArrowLeft" && caretPos === 0) {
      onMovePrev(block.id).then()
    } else if (e.key === "ArrowRight" && caretPos === text.current.length) {
      onMoveNext(block.id).then()
    }
    // } else if (e.shiftKey && e.key === '"' && !content) {
    //   e.preventDefault()
    //   setContent("“”")
    //   setBlockType(BlockType.Script)
    // }
  }

  return (
    <StyledContentEditable
      innerRef={contenteditable}
      onChange={(e) => {
        text.current = e.target.value

        console.log("으ㅏ아앙아ㅏ아아앙악")
        onChange({
          ...block,
          blockType: blockType,
          content: e.target.value,
        }).then()
        setBlockType(
          text.current.startsWith("“") && text.current.endsWith("”")
            ? BlockType.Script
            : BlockType.Description
        )
      }}
      onKeyDown={onKeyDown}
      html={text.current}
      // 임시
      blockType={blockType}
      bottomPadding={false}
    />
  )
}
export default ContentBlock
