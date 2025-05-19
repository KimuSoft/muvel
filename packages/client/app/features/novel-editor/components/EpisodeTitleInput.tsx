import { Input, type InputProps } from "@chakra-ui/react"
import React, { useCallback } from "react"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"
import { TextSelection } from "prosemirror-state"

const EpisodeTitleInput: React.FC<
  InputProps & {
    onValueChange?: (value: string) => void
  }
> = ({ onValueChange, ...props }) => {
  const { view } = useEditorContext()

  // 제목 Input에서 Enter 키를 처리하는 핸들러
  const handleTitleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!view || event.key !== "Enter") return
      // 기본 Enter 동작 (예: 폼 제출) 방지
      event.preventDefault()

      // 1. ProseMirror 에디터 뷰에 포커스 설정
      view.focus()

      // 2. 에디터 문서의 시작 부분으로 커서 이동
      const { state, dispatch } = view
      // 문서 시작 부분으로 선택 영역 설정 (pos 1은 보통 첫 문단 시작)
      const startPosition = 1 // 0은 <doc> 바로 다음, 1은 보통 <p> 내부 시작
      const safePosition = Math.min(startPosition, state.doc.content.size) // 유효 범위 확인

      const selection = TextSelection.create(state.doc, safePosition)
      // 트랜잭션을 생성하여 선택 영역을 설정하고 해당 위치로 스크롤
      const tr = state.tr.setSelection(selection).scrollIntoView()
      dispatch(tr)
    },
    [view],
  )

  return (
    <Input
      fontSize={"2xl"}
      fontWeight={"bold"}
      border={"none"}
      textAlign={"center"}
      _focus={{
        border: "none",
        outline: "none",
      }}
      px={4}
      placeholder={"제목을 입력해 주세요"}
      onKeyDown={handleTitleKeyDown}
      {...props}
    />
  )
}

export default EpisodeTitleInput
