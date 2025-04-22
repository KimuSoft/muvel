import React, { useEffect, useState } from "react"
import {
  Center,
  Dialog,
  Highlight,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Kbd,
  Portal,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import { api } from "~/utils/api"
import { useNavigate } from "react-router"
import { MdMessage } from "react-icons/md"
import { TbSearch } from "react-icons/tb"
import { Tooltip } from "~/components/ui/tooltip"
import { FaSearch } from "react-icons/fa"

const SearchModal: React.FC<{ novelId: string }> = ({ novelId }) => {
  const [hitItems, setHitItems] = useState<HitItem[]>([])
  const [query, setQuery] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetch = async () => {
    setIsLoading(true)
    const { data } = await api.get(`novels/${novelId}/search`, {
      params: { q: query },
    })
    setHitItems(data)
    setIsLoading(false)
  }

  useEffect(() => {
    if (query === "") return setHitItems([])

    const timeout = setTimeout(async () => {
      fetch().then()
    }, 100)

    return () => clearTimeout(timeout)
  }, [query])

  // 키보드 단축키로 모달 열기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["f", "F"].includes(e.key) && e.ctrlKey && e.shiftKey) {
        e.preventDefault()
        const trigger = document.getElementById("search-dialog-trigger")
        trigger?.click()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <IconButton
          id="search-dialog-trigger"
          aria-label="search"
          size="sm"
          variant="ghost"
        >
          <FaSearch />
        </IconButton>
      </Dialog.Trigger>

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
              {hitItems?.length ? (
                <VStack h="430px" overflowY="auto">
                  {hitItems.map((item) => (
                    <SearchHitItem
                      key={item.id}
                      item={item}
                      highlight={query}
                    />
                  ))}
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
    </Dialog.Root>
  )
}

const SearchHitItem: React.FC<{ item: HitItem; highlight?: string }> = ({
  item,
  highlight = "",
}) => {
  const navigate = useNavigate()

  const onClick = () => {
    navigate(`/episodes/${item.episodeId}`)
  }

  return (
    <HStack
      onClick={onClick}
      pl={5}
      pr={5}
      pt={3}
      pb={3}
      borderRadius={5}
      cursor="pointer"
      w="100%"
      bgColor={{ base: "gray.200", _dark: "gray.800" }}
      _hover={{
        backgroundColor: { base: "gray.200", _dark: "gray.600" },
      }}
      transition="background-color 0.1s ease"
      gap={5}
    >
      <Icon flexShrink={0} color="gray.500">
        <MdMessage size={25} />
      </Icon>
      <VStack align="baseline" gap={1}>
        <Tooltip content={item.content} openDelay={1000}>
          <Text>
            <Highlight
              query={highlight}
              styles={{
                // color: { base: "purple.600", _dark: "purple.300" },
                backgroundColor: { base: "purple.100", _dark: "purple.500" },
                fontWeight: 800,
              }}
            >
              {item.content?.length > 70
                ? item.content.slice(0, 70) + " ..."
                : item.content}
            </Highlight>
          </Text>
        </Tooltip>
        <HStack w="100%">
          <Text color="gray.500" fontSize="sm">
            {item.episodeName}
          </Text>
          <Spacer />
          <Text color="gray.500" fontSize="sm">
            {item.episodeNumber}편의 {item.index + 1}번째 문단
          </Text>
        </HStack>
      </VStack>
    </HStack>
  )
}

interface HitItem {
  id: string
  content: string
  novelId: string
  episodeId: string
  episodeName: string
  episodeNumber: number
  index: number
}

export default SearchModal
