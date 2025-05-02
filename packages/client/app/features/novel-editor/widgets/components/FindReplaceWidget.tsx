import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  Button,
  Group,
  HStack,
  IconButton,
  Input,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react"
import { Tooltip } from "~/components/ui/tooltip" // 경로 수정 필요
import { FaAngleLeft, FaAngleRight, FaSearch } from "react-icons/fa"
import { RxLetterCaseCapitalize } from "react-icons/rx"
import { MdFindReplace } from "react-icons/md"
import {
  WidgetBase,
  WidgetBody,
  WidgetHeader,
  WidgetTitle,
} from "~/features/novel-editor/widgets/components/WidgetBase" // 경로 수정 필요
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap" // 경로 수정 필요
import { useEditorContext } from "~/features/novel-editor/context/EditorContext" // 경로 수정 필요
import { toaster } from "~/components/ui/toaster" // 경로 수정 필요
import { TextSelection } from "prosemirror-state"

// 찾기 결과 위치 타입
interface Match {
  from: number
  to: number
}

const WIDGET_ID = "findReplace"

// --- CSS 정의 필요 ---
/*
.find-match-highlight { background-color: rgba(128, 0, 128, 0.3); ... }
.current-find-match { background-color: rgba(128, 0, 128, 0.6); ... }
*/

export const FindReplaceWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  const { view, setHighlightDecorations } = useEditorContext()

  const [findText, setFindText] = useState<string>("")
  const [replaceText, setReplaceText] = useState<string>("")
  const [matches, setMatches] = useState<Match[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1)
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string>("")
  const [isSearching, setIsSearching] = useState<boolean>(false)

  const inputRef = useRef<HTMLInputElement>(null)
  // editorContainerRef 제거 (window 스크롤 사용)

  // 에디터 DOM 마운트 시 스크롤 컨테이너 설정 (제거됨)
  // useEffect(() => { ... }, [view]);

  // 스크롤 및 포커스 함수 (수정: typewriterPlugin 로직 적용)
  const scrollToMatch = useCallback(
    (index: number) => {
      if (!view || index < 0 || index >= matches.length) return
      const match = matches[index]
      const { from, to } = match

      try {
        // 1. 먼저 해당 위치로 선택 (하이라이트와 별개로 선택 상태도 업데이트)
        const selection = TextSelection.create(view.state.doc, from, to)
        let tr = view.state.tr.setSelection(selection)
        // 기본 scrollIntoView는 제거하거나 최소한으로 사용
        // tr = tr.scrollIntoView(); // 이 줄 제거 또는 주석 처리
        view.dispatch(tr) // 선택 적용

        // 2. 중앙 정렬 스크롤 (typewriterPlugin 로직 참고)
        //    DOM 업데이트 후 실행되도록 requestAnimationFrame 사용
        requestAnimationFrame(() => {
          // 선택 시작 위치('from')의 DOM 정보 가져오기
          const domAtPos = view.domAtPos(from)
          if (!domAtPos) return

          // 실제 DOM 요소 가져오기 (텍스트 노드면 부모 요소)
          const dom =
            domAtPos.node.nodeType === Node.TEXT_NODE
              ? domAtPos.node.parentElement
              : (domAtPos.node as HTMLElement)

          if (!dom || typeof dom.getBoundingClientRect !== "function") return

          // 요소의 화면 좌표 및 크기 가져오기
          const domRect = dom.getBoundingClientRect()

          // 화면 중앙 목표 스크롤 위치 계산
          // 현재 스크롤 위치 + 요소의 화면상 top 위치 - 뷰포트 높이의 절반
          // (domRect.top은 뷰포트 상단 기준 거리)
          const targetScrollY =
            window.scrollY + domRect.top - window.innerHeight / 2

          // 계산된 위치로 부드럽게 스크롤
          window.scrollTo({
            top: targetScrollY,
            behavior: "smooth",
          })

          // 스크롤 후 포커스
          view.focus()
        })
      } catch (e) {
        console.error("Error scrolling or focusing:", e)
        try {
          view.focus()
        } catch {} // 기본 포커스 시도
      }
    },
    [view, matches],
  )

  // 검색 실행 함수
  const findMatches = useCallback(() => {
    if (!view || !findText || !setHighlightDecorations) {
      setMatches([])
      setCurrentMatchIndex(-1)
      setFeedbackMessage("")
      if (setHighlightDecorations) setHighlightDecorations([], -1)
      return
    }
    setIsSearching(true)
    setFeedbackMessage("검색 중...")
    const doc = view.state.doc
    const query = findText
    const queryLower = query.toLowerCase()
    const results: Match[] = []
    doc.descendants((node, pos) => {
      if (!node.isText || !node.text) return true
      const text = node.text
      const textLower = text.toLowerCase()
      let offset = 0
      let index
      while (
        (index = (caseSensitive ? text : textLower).indexOf(
          caseSensitive ? query : queryLower,
          offset,
        )) > -1
      ) {
        const matchStart = pos + index
        const matchEnd = matchStart + query.length
        if (matchStart >= 0 && matchEnd <= doc.content.size) {
          results.push({ from: matchStart, to: matchEnd })
        } else {
          console.warn("Match found outside document bounds:", {
            from: matchStart,
            to: matchEnd,
          })
        }
        offset = index + query.length
      }
      return false
    })
    setMatches(results)
    setIsSearching(false)
    if (results.length > 0) {
      const firstIndex = 0
      setCurrentMatchIndex(firstIndex)
      setFeedbackMessage(`${results.length}개 찾음`)
      setHighlightDecorations(results, firstIndex)
      scrollToMatch(firstIndex) // 수정된 scrollToMatch 호출
    } else {
      setCurrentMatchIndex(-1)
      setFeedbackMessage("일치하는 항목 없음")
      setHighlightDecorations([], -1)
    }
  }, [view, findText, caseSensitive, setHighlightDecorations, scrollToMatch])

  // 다음 찾기
  const handleFindNext = useCallback(() => {
    if (matches.length === 0 || !setHighlightDecorations) return
    const nextIndex = (currentMatchIndex + 1) % matches.length
    setCurrentMatchIndex(nextIndex)
    setHighlightDecorations(matches, nextIndex)
    scrollToMatch(nextIndex) // 수정된 scrollToMatch 호출
  }, [matches, currentMatchIndex, setHighlightDecorations, scrollToMatch])

  // 이전 찾기
  const handleFindPrev = useCallback(() => {
    if (matches.length === 0 || !setHighlightDecorations) return
    const prevIndex = (currentMatchIndex - 1 + matches.length) % matches.length
    setCurrentMatchIndex(prevIndex)
    setHighlightDecorations(matches, prevIndex)
    scrollToMatch(prevIndex) // 수정된 scrollToMatch 호출
  }, [matches, currentMatchIndex, setHighlightDecorations, scrollToMatch])

  // 현재 선택된 항목 바꾸기
  const handleReplace = useCallback(() => {
    if (!view || currentMatchIndex < 0 || currentMatchIndex >= matches.length)
      return
    const match = matches[currentMatchIndex]
    const { from, to } = match
    const schema = view.state.schema
    try {
      let tr = view.state.tr
      if (replaceText === "") {
        tr = tr.delete(from, to)
      } else {
        tr = tr.replaceWith(from, to, schema.text(replaceText))
      }
      view.dispatch(tr)
      setFeedbackMessage("1개 항목 바꿈")
      setTimeout(findMatches, 50)
    } catch (e) {
      console.error("Error during replace:", e)
      setFeedbackMessage("바꾸기 중 오류 발생")
      setMatches([])
      setCurrentMatchIndex(-1)
      if (setHighlightDecorations) setHighlightDecorations([], -1)
    }
  }, [
    view,
    matches,
    currentMatchIndex,
    replaceText,
    findMatches,
    setHighlightDecorations,
  ])

  // 모두 바꾸기
  const handleReplaceAll = useCallback(() => {
    if (!view || matches.length === 0 || !findText) return
    const schema = view.state.schema
    let transaction = view.state.tr
    let replacedCount = 0
    ;[...matches].reverse().forEach((match) => {
      try {
        if (replaceText === "") {
          transaction = transaction.delete(match.from, match.to)
        } else {
          transaction = transaction.replaceWith(
            match.from,
            match.to,
            schema.text(replaceText),
          )
        }
        replacedCount++
      } catch (e) {
        console.error(
          `Error replacing match at [${match.from}, ${match.to}]:`,
          e,
        )
      }
    })
    if (replacedCount > 0) {
      view.dispatch(transaction)
      toaster.success({
        title: `${replacedCount}개 항목 모두 바꿈`,
        duration: 3000,
      })
    } else {
      toaster.warning({ title: "바꿀 항목이 없거나 오류 발생", duration: 3000 })
    }
    setMatches([])
    setCurrentMatchIndex(-1)
    setFeedbackMessage("")
    if (setHighlightDecorations) setHighlightDecorations([], -1)
  }, [view, matches, findText, replaceText, setHighlightDecorations])

  // 찾을 텍스트 또는 대소문자 구분 변경 시 초기화
  useEffect(() => {
    setMatches([])
    setCurrentMatchIndex(-1)
    setFeedbackMessage("")
    if (setHighlightDecorations) {
      setHighlightDecorations([], -1)
    }
  }, [findText, caseSensitive, setHighlightDecorations])

  // 컴포넌트 언마운트 시 데코레이션 초기화
  useEffect(() => {
    return () => {
      if (setHighlightDecorations) {
        setHighlightDecorations([], -1)
      }
    }
  }, [setHighlightDecorations])

  return (
    <WidgetBase>
      <WidgetHeader>
        <HStack flex="1" cursor="grab" {...dragAttributes} {...dragListeners}>
          <MdFindReplace />
          <WidgetTitle>찾기 및 바꾸기</WidgetTitle>
        </HStack>
      </WidgetHeader>
      <WidgetBody>
        <Stack gap={3}>
          <HStack>
            <Input
              ref={inputRef}
              placeholder="찾을 내용"
              size="sm"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") findMatches()
              }}
            />
            <Tooltip content="대소문자 구분">
              <IconButton
                aria-label="대소문자 구분"
                size="sm"
                variant={caseSensitive ? "solid" : "outline"}
                colorScheme={caseSensitive ? "blue" : "gray"}
                onClick={() => setCaseSensitive(!caseSensitive)}
              >
                <RxLetterCaseCapitalize />
              </IconButton>
            </Tooltip>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={findMatches}
              loading={isSearching}
              disabled={!findText}
            >
              <FaSearch style={{ marginRight: "0.25rem" }} />
              찾기
            </Button>
          </HStack>
          <Input
            placeholder="바꿀 내용"
            size="sm"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            disabled={matches.length === 0}
          />
          <HStack justify="space-between" align="center">
            <Text fontSize="xs" color="gray.500" flexShrink={1}>
              {feedbackMessage ||
                (matches.length > 0
                  ? `${currentMatchIndex + 1} / ${matches.length}`
                  : "")}
            </Text>
            <Spacer />
            <HStack>
              <Tooltip content="이전 찾기">
                <IconButton
                  aria-label="이전 찾기"
                  size="xs"
                  onClick={handleFindPrev}
                  disabled={matches.length <= 1}
                >
                  <FaAngleLeft />
                </IconButton>
              </Tooltip>
              <Tooltip content="다음 찾기">
                <IconButton
                  aria-label="다음 찾기"
                  size="xs"
                  onClick={handleFindNext}
                  disabled={matches.length <= 1}
                >
                  <FaAngleRight />
                </IconButton>
              </Tooltip>
              <Button
                size="xs"
                onClick={handleReplace}
                disabled={currentMatchIndex === -1}
              >
                바꾸기
              </Button>
              <Button
                size="xs"
                onClick={handleReplaceAll}
                disabled={matches.length === 0}
                colorScheme="red"
              >
                모두 바꾸기
              </Button>
            </HStack>
          </HStack>
        </Stack>
      </WidgetBody>
    </WidgetBase>
  )
}
