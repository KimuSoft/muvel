import React, { useEffect } from "react"
import {
  Box,
  Button,
  Center,
  Container,
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  Textarea,
  useDisclosure,
  useRadioGroup,
} from "@chakra-ui/react"
import NovelCard from "../molecules/NovelCard"
import { api } from "../../utils/api"
import { Novel } from "../../types/novel.type"
import RadioCard from "../molecules/RadioCard"
import Header from "../organisms/Header"
import { useNavigate } from "react-router-dom"
import useCurrentUser from "../../hooks/useCurrentUser"
import { toast } from "react-toastify"
import { BiSearch } from "react-icons/bi"
import { AiFillFileAdd } from "react-icons/ai"

const NovelsPage: React.FC = () => {
  const user = useCurrentUser()

  const [novels, setNovels] = React.useState<Novel[]>([])
  const [searchRange, setSearchRange] = React.useState<"내 소설" | "모든 소설">(
    "내 소설"
  )

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "range",
    defaultValue: "내 소설",
    onChange: (value: string) => {
      setSearchRange(value as "내 소설" | "모든 소설")
      return
    },
  })

  const group = getRootProps()

  const fetchNovels = async () => {
    if (!user) return
    const { data } = await api.get<Novel[]>(
      searchRange === "내 소설" ? `users/${user.id}/novels` : "novels"
    )
    console.log(data)
    setNovels(data)
  }

  useEffect(() => {
    fetchNovels().then()
  }, [searchRange])

  return (
    <>
      <Header />
      <Container
        display="flex"
        flexDirection="column"
        maxW="7xl"
        gap={10}
        pt={5}
      >
        <HStack spacing={5}>
          <HStack {...group} flexShrink="0">
            {["모든 소설", "내 소설"].map((value) => {
              const radio = getRadioProps({ value })
              return (
                <RadioCard key={value} {...radio}>
                  {value}
                </RadioCard>
              )
            })}
          </HStack>
          <InputGroup maxW="2xl">
            <Input placeholder="검색어를 입력해보세요. 아 참고로 작동은 안 해요" />
            <InputRightElement>
              <BiSearch />
            </InputRightElement>
          </InputGroup>
          <Spacer />
          <CreateNovelButton />
        </HStack>
        {novels.length ? (
          <Box
            display="flex"
            flexWrap="wrap"
            gap="20px"
            justifyContent="center"
          >
            {novels.map((novel) => (
              <NovelCard novel={novel} key={novel.id} />
            ))}
          </Box>
        ) : (
          <Center h="400px">
            <Text color="gray.500" fontSize="2xl">
              으음... 소설이 없네요
            </Text>
          </Center>
        )}
      </Container>
    </>
  )
}

const CreateNovelButton: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const user = useCurrentUser()

  const initialRef = React.useRef(null)
  const navigate = useNavigate()

  const onSubmit = async () => {
    const { data } = await api.post<Novel>(`/users/${user?.id}/novels`, {
      title: "새 소설",
      description: "설명",
    })
    navigate(`/novels/${data.id}`)
  }

  const _onOpen = () => {
    if (!user) return toast.warn("소설을 쓰려면 로그인을 먼저 해 주세요!")
    onOpen()
  }

  return (
    <>
      <Button gap={3} colorScheme="purple" onClick={onOpen}>
        <AiFillFileAdd /> 소설 추가하기
      </Button>

      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>새 소설 작성하기</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>제목</FormLabel>
              <Input ref={initialRef} placeholder="소설의 제목을 지어주세요." />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>설명</FormLabel>
              <Textarea placeholder="소설의 설명을 입력해 주세요" />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose} mr={3}>
              취소
            </Button>
            <Button colorScheme="blue" onClick={onSubmit}>
              생성하기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default NovelsPage
