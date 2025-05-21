import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Box,
  Center,
  Dialog,
  DrawerTrigger,
  Input,
  InputGroup,
  Kbd,
  Portal,
  Spinner,
  Text,
  type UseDialogReturn,
  VStack,
} from "@chakra-ui/react"
import { api } from "~/utils/api"
import { MdMessage } from "react-icons/md"
import { TbMessage, TbSearch } from "react-icons/tb"
import {
  NovelSearchItemType,
  type NovelSearchResult,
  type SearchInNovelResponse,
} from "muvel-api-types"
import SearchInNovelItem from "~/features/novel-editor/components/SearchInNovelItem"
import { useDebouncedCallback } from "use-debounce"

const SearchDialog: React.FC<{
  novelId: string
  children?: ReactNode
  dialog: UseDialogReturn
}> = ({ novelId, children, dialog }) => {
  const [hitItems, setHitItems] = useState<NovelSearchResult[]>([])
  const [query, setQuery] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    const { data } = await api.get<SearchInNovelResponse>(
      `novels/${novelId}/search`,
      {
        params: { q: query },
      },
    )
    setHitItems(data.hits)
    setIsLoading(false)
  }, [query])

  const debouncedFetch = useDebouncedCallback(fetch, 500)

  useEffect(() => {
    if (query === "") {
      debouncedFetch.cancel()
      setIsLoading(false)
      return setHitItems([])
    }

    setIsLoading(true)
    debouncedFetch()

    return () => {
      debouncedFetch.cancel()
    }
  }, [query])

  // 키보드 단축키로 모달 열기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["f", "F"].includes(e.key) && e.ctrlKey && e.shiftKey) {
        e.preventDefault()
        dialog.setOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const hitList = useMemo(() => {
    const hitList_: ReactNode[] = []

    for (const hit of hitItems) {
      switch (hit.itemType) {
        case NovelSearchItemType.Episode: {
          hitList_.push(
            <SearchInNovelItem
              key={hit.id}
              title={`${hit.order}편: ${hit.title}`}
              highlight={query}
              icon={<TbMessage />}
              link={`/episodes/${hit.id}`}
              description={hit.description}
            />,
          )
          break
        }

        case NovelSearchItemType.EpisodeBlock: {
          hitList_.push(
            <SearchInNovelItem
              key={hit.id}
              title={hit.content}
              highlight={query}
              icon={<TbMessage />}
              link={`/episodes/${hit.episodeId}`}
              description={`${hit.episodeNumber}편: ${hit.episodeName}`}
              subDescription={`${hit.episodeNumber}편 ${(hit.order + 1).toLocaleString()}번째 줄`}
            />,
          )
          break
        }

        case NovelSearchItemType.WikiPage: {
          hitList_.push(
            <SearchInNovelItem
              key={hit.id}
              title={hit.title}
              highlight={query}
              icon={<MdMessage />}
              link={`/wiki-pages/${hit.id}`}
              description={hit.summary}
            />,
          )
          break
        }

        case NovelSearchItemType.WikiBlock: {
          hitList_.push(
            <SearchInNovelItem
              key={hit.id}
              title={hit.content}
              highlight={query}
              icon={<MdMessage />}
              link={`/wiki-pages/${hit.wikiPageId}`}
              description={hit.wikiPageName}
              subDescription={`${hit.wikiPageName} ${hit.order + 1}번째 줄`}
            />,
          )
          break
        }

        default: {
          hitList_.push(
            <Box>
              <Text>알 수 없는 타입입니다.</Text>
            </Box>,
          )
          break
        }
      }
    }

    return hitList_
  }, [hitItems])

  return (
    <Dialog.RootProvider value={dialog}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content minH="xl">
            <Dialog.Header>
              <InputGroup startElement={<TbSearch color="gray.300" />}>
                <Input
                  placeholder="소설 내 블록, 등장인물, 설정 검색하기..."
                  onChange={(e) => setQuery(e.target.value)}
                />
              </InputGroup>
            </Dialog.Header>

            <Dialog.Body>
              {isLoading ? (
                <Center h="400px">
                  <Spinner />
                </Center>
              ) : hitList?.length ? (
                <VStack
                  w={"100%"}
                  h="430px"
                  overflowY="auto"
                  overflowX={"hidden"}
                  gap={1}
                >
                  {hitList}
                </VStack>
              ) : !query ? (
                <Center h="400px">
                  <Text color="gray.500">검색어를 입력해 보세요!</Text>
                </Center>
              ) : (
                <Center h="400px">
                  <Text color="gray.500">
                    '{query}'에 관해서 못 찾았어요...
                  </Text>
                </Center>
              )}
            </Dialog.Body>

            <Dialog.Footer justifyContent="center">
              <Text color="gray.500" fontSize="sm">
                에디터 어디서든 <Kbd>Ctrl/⌘</Kbd> + <Kbd>Shift</Kbd> +{" "}
                <Kbd>F</Kbd>를 누르면 검색할 수 있어요!
              </Text>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  )
}

export default SearchDialog
