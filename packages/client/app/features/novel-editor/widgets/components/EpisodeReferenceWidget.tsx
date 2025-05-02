import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Box,
  createListCollection,
  HStack,
  Icon,
  Select,
  SelectItem,
  Spinner,
  Textarea,
  VStack,
} from "@chakra-ui/react" // createListCollection 임포트
import { LuBookMarked } from "react-icons/lu" // 위젯 아이콘 예시
import { toaster } from "~/components/ui/toaster" // Toaster 경로 수정 필요
// API 함수 및 타입 임포트 (경로 및 실제 구현 필요)
import { getNovel } from "~/api/api.novel" // 경로 수정 필요
// Editor Context (현재 novelId 접근 가정)
import { useEditorContext } from "~/features/novel-editor/context/EditorContext" // 경로 수정 필요
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap" // 경로 수정 필요
import {
  WidgetBase,
  WidgetBody,
  WidgetHeader,
  WidgetTitle,
} from "~/features/novel-editor/widgets/components/WidgetBase"
import { getEpisode } from "~/api/api.episode" // 경로 수정 필요

// --- 에피소드 참조 위젯 컴포넌트 ---
const WIDGET_ID = "episodeReference"

// Select 아이템 타입 정의
interface EpisodeSelectItem {
  label: string
  value: string // episodeId
}

export const EpisodeReferenceWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  // 가정: EditorContext에서 현재 novelId를 가져옴 (실제 구현 필요)
  const { episode: currentEpisode } = useEditorContext()
  const novelId = currentEpisode?.novel?.id // 현재 에피소드의 소설 ID 사용

  const [novelEpisodes, setNovelEpisodes] = useState<EpisodeSelectItem[]>([])
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(
    null,
  )
  const [selectedEpisodeContent, setSelectedEpisodeContent] =
    useState<string>("")
  const [isNovelLoading, setIsNovelLoading] = useState<boolean>(false)
  const [isEpisodeLoading, setIsEpisodeLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Select 컬렉션 생성 (useMemo 사용)
  const episodeCollection = useMemo(
    () => createListCollection({ items: novelEpisodes }),
    [novelEpisodes],
  )

  // 소설 정보 및 에피소드 목록 불러오기
  const fetchNovelEpisodes = useCallback(async () => {
    if (!novelId) {
      setError("소설 정보를 찾을 수 없습니다.")
      return
    }
    setIsNovelLoading(true)
    setError(null)
    try {
      const novelData = await getNovel(novelId)
      const formattedEpisodes = novelData.episodes
        .sort(
          (a, b) =>
            parseFloat(a.order.toString()) - parseFloat(b.order.toString()),
        ) // 순서대로 정렬
        .map((ep) => ({
          label: ep.title || `에피소드 ${ep.order}`,
          value: ep.id,
        }))
      setNovelEpisodes(formattedEpisodes)
      // 현재 에피소드는 기본 선택에서 제외 (선택적)
      // setSelectedEpisodeId(null);
      // setSelectedEpisodeContent("");
    } catch (err) {
      console.error("Failed to fetch novel episodes:", err)
      setError("에피소드 목록을 불러오는 데 실패했습니다.")
      setNovelEpisodes([])
      toaster.error({ title: "오류", description: "에피소드 목록 로딩 실패" })
    } finally {
      setIsNovelLoading(false)
    }
  }, [novelId])

  // 위젯 마운트 시 또는 novelId 변경 시 에피소드 목록 로드
  useEffect(() => {
    fetchNovelEpisodes()
  }, [fetchNovelEpisodes]) // fetchNovelEpisodes 함수 참조가 변경될 때 실행

  // 선택된 에피소드 내용 불러오기
  const fetchEpisodeContent = useCallback(async (episodeId: string) => {
    if (!episodeId) return
    setIsEpisodeLoading(true)
    setError(null)
    try {
      const episodeData = await getEpisode(episodeId)
      // 블록 텍스트 추출 및 결합 (개행 2번으로 구분)
      const content = episodeData.blocks
        .map((block) => block.text || "")
        .join("\n\n")
      setSelectedEpisodeContent(content)
    } catch (err) {
      console.error("Failed to fetch episode content:", err)
      setError("에피소드 내용을 불러오는 데 실패했습니다.")
      setSelectedEpisodeContent("")
      toaster.error({ title: "오류", description: "에피소드 내용 로딩 실패" })
    } finally {
      setIsEpisodeLoading(false)
    }
  }, []) // 의존성 없음 (episodeId는 인자로 받음)

  // selectedEpisodeId 변경 시 내용 로드
  useEffect(() => {
    if (selectedEpisodeId) {
      fetchEpisodeContent(selectedEpisodeId)
    } else {
      setSelectedEpisodeContent("") // 선택 해제 시 내용 비우기
    }
  }, [selectedEpisodeId, fetchEpisodeContent])

  return (
    <WidgetBase>
      <WidgetHeader>
        <HStack flex="1" cursor="grab" {...dragAttributes} {...dragListeners}>
          <Icon as={LuBookMarked} />
          <WidgetTitle>에피소드 참조</WidgetTitle>
        </HStack>
        {/* 로딩 상태 표시 (선택적) */}
        {(isNovelLoading || isEpisodeLoading) && <Spinner size="xs" />}
      </WidgetHeader>

      <WidgetBody>
        <VStack gap={3} align="stretch">
          {/* 에피소드 선택 Select */}
          <Select.Root
            collection={episodeCollection} // 컬렉션 사용
            value={selectedEpisodeId ? [selectedEpisodeId] : []} // value는 배열 형태
            onValueChange={(details) => {
              // details.value는 선택된 값의 배열
              setSelectedEpisodeId(details.value[0] ?? null)
            }}
            disabled={isNovelLoading || novelEpisodes.length === 0}
            size="sm"
            width="100%" // 너비 설정
          >
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="참조할 에피소드 선택..." />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {/* 로딩 중 표시 */}
                {isNovelLoading && (
                  <SelectItem
                    item={{
                      value: "_loading",
                      label: "불러오는 중...",
                      disabled: true,
                    }}
                  >
                    불러오는 중...
                  </SelectItem>
                )}
                {/* 에러 표시 */}
                {error && !isNovelLoading && (
                  <SelectItem
                    item={{
                      value: "_error",
                      label: "오류 발생",
                      disabled: true,
                    }}
                  >
                    {error}
                  </SelectItem>
                )}
                {/* 에피소드 목록 */}
                {!isNovelLoading && !error && novelEpisodes.length === 0 && (
                  <SelectItem
                    item={{
                      value: "_empty",
                      label: "에피소드 없음",
                      disabled: true,
                    }}
                  >
                    에피소드 없음
                  </SelectItem>
                )}
                {!isNovelLoading &&
                  !error &&
                  novelEpisodes.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      {/* 현재 에피소드 표시 (선택적) */}
                      {item.value === currentEpisode?.id
                        ? `(현재) ${item.label}`
                        : item.label}
                    </Select.Item>
                  ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>

          {/* 선택된 에피소드 내용 미리보기 */}
          <Box position="relative">
            {/* 로딩 오버레이 */}
            {isEpisodeLoading && (
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                bg="whiteAlpha.600"
                _dark={{ bg: "blackAlpha.600" }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                zIndex="1"
                borderRadius="md"
              >
                <Spinner size="md" />
              </Box>
            )}
            <Textarea
              placeholder="에피소드를 선택하면 내용이 표시됩니다."
              value={selectedEpisodeContent}
              readOnly // 읽기 전용
              minH="200px" // 최소 높이
              h="40vh" // 화면 높이 비례 (조정 가능)
              fontSize="sm"
              fontFamily="monospace" // 고정폭 글꼴
              whiteSpace="pre-wrap" // 줄바꿈/공백 유지
              borderColor="gray.300"
              _dark={{ borderColor: "gray.600" }}
              disabled={isEpisodeLoading} // 로딩 중 비활성화
            />
          </Box>
        </VStack>
      </WidgetBody>
    </WidgetBase>
  )
}
