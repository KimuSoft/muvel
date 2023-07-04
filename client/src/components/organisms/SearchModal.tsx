import React, { useEffect, useState } from "react"
import {
  Center,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Kbd,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  theme,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { BiSearch } from "react-icons/bi"
import { api } from "../../utils/api"
import { useNavigate } from "react-router-dom"
import { MdMessage } from "react-icons/md"

const SearchModal: React.FC<{ novelId: string }> = ({ novelId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

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

  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      console.log(e.key, e.ctrlKey, e.shiftKey)
      if (["f", "F"].includes(e.key) && e.ctrlKey && e.shiftKey) {
        e.preventDefault()
        onOpen()
      }
    })
  }, [])

  return (
    <>
      <Tooltip label={"소설 안에서 검색하기"}>
        <IconButton
          aria-label={"search"}
          icon={<BiSearch />}
          onClick={onOpen}
        />
      </Tooltip>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent minH={"xl"}>
          <ModalHeader>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <BiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="소설 내 블록, 등장인물, 설정 검색하기..."
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
          </ModalHeader>
          <ModalBody>
            {hitItems.length ? (
              <VStack>
                {hitItems.map((item) => (
                  <SearchHitItem key={item.id} item={item} />
                ))}
              </VStack>
            ) : !query ? (
              <Center h="400px">
                <Text color={"gray.500"}>검색어를 입력해 보세요!</Text>
              </Center>
            ) : (
              <Center h="400px">
                <Text color={"gray.500"}>
                  '{query}'에 관해서 못 찾았어요...
                </Text>
              </Center>
            )}
          </ModalBody>

          <ModalFooter justifyContent={"center"}>
            <Text color={"gray.500"} fontSize={"sm"}>
              에디터 어디서든 <Kbd>Ctrl/⌘</Kbd> + <Kbd>Shift</Kbd>+ <Kbd>F</Kbd>
              를 누르면 검색할 수 있어요!
            </Text>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

const SearchHitItem: React.FC<{ item: HitItem }> = ({ item }) => {
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
      bgColor={useColorModeValue("gray.200", "gray.800")}
      _hover={{
        backgroundColor: useColorModeValue("gray.200", "gray.600"),
      }}
      transition={"background-color 0.1s ease"}
      gap={5}
    >
      <MdMessage size={25} color={theme.colors.gray["500"]} />
      <VStack align={"baseline"} gap={1}>
        <Text>{item.content}</Text>
        <HStack w="100%">
          <Text color={"gray.500"} fontSize={"sm"}>
            {item.episodeName}
          </Text>
          <Spacer />
          <Text color={"gray.500"} fontSize={"sm"}>
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
