import React, { useCallback, useState } from "react"
import {
  Box,
  Button,
  Center,
  HStack,
  IconButton,
  Input,
  Spinner,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react" // toaster, Separator 임포트 확인
import { FaBook, FaSearch } from "react-icons/fa" // 아이콘
// Base Widget Components & Types (경로는 실제 프로젝트 구조에 맞게 조정)
import {
  WidgetBase,
  WidgetBody,
  WidgetHeader,
  WidgetTitle,
} from "~/features/editor/widgets/components/WidgetBase"
import type { WidgetBaseProps } from "~/features/editor/widgets/components/widgetMap"
import { toaster } from "~/components/ui/toaster"

// --- 타입 정의 시작 ---

interface DictionaryHit {
  sourceId: string
  name: string
  simplifiedName: string
  origin: string | null
  pronunciation: string | null
  definition: string
  pos: number
  tags: string[]
  thumbnail: string | null
}

interface DictionaryApiResponse {
  hits: DictionaryHit[]
  query: string
  processingTimeMs: number
  limit: number
  offset: number
  estimatedTotalHits: number
}

// --- 타입 정의 끝 ---

// --- 사전 위젯 컴포넌트 시작 ---

const WIDGET_ID = "dictionary"
const API_ENDPOINT = "https://dict.kimustory.net/api/words/search"
const DEFAULT_LIMIT = 5

export const DictionaryWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [currentQuery, setCurrentQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useState<DictionaryHit[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null) // 내부 에러 상태
  const [totalHits, setTotalHits] = useState<number>(0)
  const [offset, setOffset] = useState<number>(0)
  const limit = DEFAULT_LIMIT

  // const toast = useToast() // 제거

  // API 호출 함수
  const fetchResults = useCallback(
    async (query: string, currentOffset: number, currentLimit: number) => {
      if (!query.trim()) {
        setSearchResults([])
        setTotalHits(0)
        setError(null)
        setCurrentQuery("")
        return
      }

      setIsLoading(true)
      setError(null)
      if (currentOffset === 0) {
        setSearchResults([])
        setTotalHits(0)
      }
      setCurrentQuery(query)

      try {
        const url = `${API_ENDPOINT}?q=${encodeURIComponent(query)}&limit=${currentLimit}&offset=${currentOffset}`
        const response = await fetch(url)

        if (!response.ok) {
          console.log("API 응답 오류:", response)
          const errorText =
            response.statusText || `HTTP error! status: ${response.status}`
          throw new Error(`API 요청 실패: ${errorText}`)
        }

        const data: DictionaryApiResponse = await response.json()

        setSearchResults((prev) =>
          currentOffset === 0 ? data.hits : [...prev, ...data.hits],
        )
        setTotalHits(data.estimatedTotalHits)
      } catch (err) {
        console.error("사전 검색 API 오류:", err)
        const errorMessage =
          err instanceof Error
            ? err.message
            : "사전 검색 중 오류가 발생했습니다."
        setError(errorMessage)
        setSearchResults([])
        setTotalHits(0)
        // === toaster 사용 ===
        toaster.error({
          // .error 또는 .add 등 실제 메서드명 확인 필요
          title: "사전 검색 실패",
          description: errorMessage,
          duration: 5000,
          // isClosable: true, // toaster 객체 API에 따라 옵션 상이할 수 있음
        })
        // ====================
      } finally {
        setIsLoading(false)
      }
    },
    [],
  ) // 의존성 배열에서 toast 제거 (toaster는 전역 객체일 수 있으므로 불필요)

  // 검색 실행 핸들러
  const handleSearch = useCallback(() => {
    setOffset(0)
    fetchResults(searchTerm, 0, limit)
  }, [searchTerm, limit, fetchResults])

  // Enter 키 처리
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch()
    }
  }

  // 더보기 핸들러
  const handleLoadMore = useCallback(() => {
    const nextOffset = offset + limit
    fetchResults(currentQuery, nextOffset, limit)
    setOffset(nextOffset)
  }, [offset, limit, currentQuery, fetchResults])

  // 더보기 가능 여부
  const canLoadMore =
    !isLoading &&
    searchResults.length > 0 &&
    offset + searchResults.length < totalHits

  return (
    <WidgetBase>
      {/* 헤더 */}
      <WidgetHeader>
        <HStack flex="1" cursor="grab" {...dragAttributes} {...dragListeners}>
          <FaBook />
          <WidgetTitle>사전</WidgetTitle>
        </HStack>
      </WidgetHeader>

      {/* 본문 */}
      <WidgetBody>
        <VStack w="100%" gap={3} align="stretch">
          {/* 검색 입력 영역 */}
          <HStack>
            <Input
              placeholder="단어 검색 (Enter)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
              size="sm"
              disabled={isLoading}
            />
            <IconButton
              aria-label="검색"
              onClick={handleSearch}
              size="sm"
              colorScheme="blue"
              loading={isLoading}
              disabled={!searchTerm.trim()}
            >
              <FaSearch />
            </IconButton>
          </HStack>

          {/* 로딩 상태 */}
          {isLoading && searchResults.length === 0 && (
            <Center p={4}>
              <Spinner size="md" />
            </Center>
          )}

          {/* 에러 메시지 영역 (제거됨) */}

          {/* 검색 결과 없음 메시지 */}
          {!isLoading &&
            !error &&
            currentQuery &&
            searchResults.length === 0 && (
              <Text textAlign="center" color="gray.500" fontSize="sm" p={4}>
                '{currentQuery}'에 대한 검색 결과가 없습니다.
              </Text>
            )}

          {/* 검색 결과 목록 */}
          {searchResults.length > 0 && (
            // === Divider -> Separator 로 변경 ===
            <VStack
              gap={3}
              align="stretch"
              maxH="300px"
              overflowY="auto"
              pr={2}
            >
              {/* =============================== */}
              {searchResults.map((hit) => (
                <Box key={hit.sourceId}>
                  <HStack justify="space-between" align="baseline">
                    <Text fontWeight="bold" fontSize="md">
                      {hit.simplifiedName || hit.name}
                    </Text>
                    {hit.pronunciation && (
                      <Text fontSize="sm" color="gray.600">
                        [{hit.pronunciation}]
                      </Text>
                    )}
                  </HStack>
                  {hit.origin && hit.origin !== hit.name && (
                    <Text fontSize="xs" color="gray.500">
                      ({hit.origin})
                    </Text>
                  )}
                  <Text fontSize="sm" mt={1} whiteSpace="pre-wrap">
                    {hit.definition}
                  </Text>
                  {/* 수정된 Tag 사용법 */}
                  {hit.tags && hit.tags.length > 0 && (
                    <HStack wrap="wrap" mt={2} gap={1}>
                      {hit.tags.map((tag) => (
                        <Tag.Root
                          key={tag}
                          size="sm"
                          variant="subtle"
                          colorScheme="teal"
                        >
                          <Tag.Label>{tag}</Tag.Label>
                        </Tag.Root>
                      ))}
                    </HStack>
                  )}
                </Box>
              ))}
              {!isLoading && totalHits > 0 && (
                <Text textAlign="center" fontSize="xs" color="gray.500" pt={1}>
                  총 {totalHits.toLocaleString()}개 검색됨
                </Text>
              )}
            </VStack>
          )}

          {/* 더보기 버튼 */}
          {canLoadMore && (
            <Button
              onClick={handleLoadMore}
              size="sm"
              loading={isLoading}
              mt={2}
              variant="outline"
            >
              더보기 ({offset + limit + 1}~)
            </Button>
          )}
        </VStack>
      </WidgetBody>
    </WidgetBase>
  )
}
// --- 사전 위젯 컴포넌트 끝 ---
