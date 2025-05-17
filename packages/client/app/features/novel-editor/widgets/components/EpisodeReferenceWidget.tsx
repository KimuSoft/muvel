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
} from "@chakra-ui/react"
import { LuBookMarked } from "react-icons/lu"
import { toaster } from "~/components/ui/toaster"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap"
import {
  WidgetBase,
  WidgetBody,
  WidgetHeader,
  WidgetTitle,
} from "~/features/novel-editor/widgets/containers/WidgetBase"
import { getNovel } from "~/services/novelService"
import { getEpisodeBlocks } from "~/services/episodeService"
import { useEditorStyleOptions } from "~/hooks/useAppOptions"

interface EpisodeSelectItem {
  label: string
  value: string
}

export const EpisodeReferenceWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  const { episode: currentEpisode } = useEditorContext()
  const novelId = currentEpisode?.novel?.id

  const [editorStyle] = useEditorStyleOptions()
  const [novelEpisodes, setNovelEpisodes] = useState<EpisodeSelectItem[]>([])
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(
    null,
  )
  const [selectedEpisodeContent, setSelectedEpisodeContent] =
    useState<string>("")
  const [isNovelLoading, setIsNovelLoading] = useState<boolean>(false)
  const [isEpisodeLoading, setIsEpisodeLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const episodeCollection = useMemo(
    () => createListCollection({ items: novelEpisodes }),
    [novelEpisodes],
  )

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
    void fetchNovelEpisodes()
  }, [fetchNovelEpisodes])

  // 선택된 에피소드 내용 불러오기
  const fetchEpisodeContent = useCallback(async (episodeId: string) => {
    if (!episodeId) return
    setIsEpisodeLoading(true)
    setError(null)
    try {
      // TODO: EditorContext에서 share와 novelId를 내려주는 방식으로 최적화해야 함
      const blocks = await getEpisodeBlocks(episodeId)
      const content = blocks.map((block) => block.text || "").join("\n\n")
      setSelectedEpisodeContent(content)
    } catch (err) {
      console.error("Failed to fetch episode content:", err)
      setError("에피소드 내용을 불러오는 데 실패했습니다.")
      setSelectedEpisodeContent("")
      toaster.error({ title: "오류", description: "에피소드 내용 로딩 실패" })
    } finally {
      setIsEpisodeLoading(false)
    }
  }, [])

  // selectedEpisodeId 변경 시 내용 로드
  useEffect(() => {
    if (selectedEpisodeId) {
      void fetchEpisodeContent(selectedEpisodeId)
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
            value={selectedEpisodeId ? [selectedEpisodeId] : []}
            onValueChange={(details) => {
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
              readOnly
              minH="200px"
              h="40vh"
              fontSize="sm"
              border={"none"}
              p={0}
              lineHeight={1.5}
              fontFamily={editorStyle.fontFamily}
              whiteSpace="pre-wrap" // 줄바꿈/공백 유지
              borderColor="gray.300"
              _dark={{ borderColor: "gray.600" }}
              disabled={isEpisodeLoading} // 로딩 중 비활성화
              css={{
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#ccc",
                  borderRadius: "3px",
                },
              }}
            />
          </Box>
        </VStack>
      </WidgetBody>
    </WidgetBase>
  )
}
