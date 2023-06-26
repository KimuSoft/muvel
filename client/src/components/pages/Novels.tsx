import React, { useEffect } from "react"
import {
  Box,
  Button,
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
  Textarea,
  useDisclosure,
  useRadioGroup,
} from "@chakra-ui/react"
import NovelCard from "../molecules/NovelCard"
import ToggleColorModeButton from "../atoms/ToggleColorModeButton"
import { api } from "../../utils/api"
import { Novel } from "../../types/novel.type"
import RadioCard from "../molecules/RadioCard"
import { AiFillFileAdd, BiSearch } from "react-icons/all"
import EditorHeader from "../organisms/editorHeader/EditorHeader"
import Header from "../organisms/Header"
import { useNavigate } from "react-router-dom"

const NovelsPage: React.FC = () => {
  const [novels, setNovels] = React.useState<Novel[]>([])

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "range",
    defaultValue: "내 소설",
    onChange: console.log,
  })

  const group = getRootProps()

  const fetchNovels = async () => {
    const { data } = await api.get<Novel[]>("novels")
    console.log(data)
    setNovels(data)
  }

  useEffect(() => {
    fetchNovels().then()
  }, [])

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
          <HStack {...group}>
            {["모든 소설", "내 소설"].map((value) => {
              const radio = getRadioProps({ value })
              return (
                <RadioCard key={value} {...radio}>
                  {value}
                </RadioCard>
              )
            })}
          </HStack>
          <InputGroup w="2xl">
            <Input placeholder="검색어를 입력해보세요. 아 참고로 작동은 안 해요" />
            <InputRightElement>
              <BiSearch />
            </InputRightElement>
          </InputGroup>
          <Spacer />
          <CreateNovelButton />
        </HStack>
        <Box display="flex" flexWrap="wrap" gap="20px" justifyContent="center">
          {novels.map((novel) => (
            <NovelCard novel={novel} key={novel.id} />
          ))}
        </Box>
      </Container>
    </>
  )
}

const CreateNovelButton: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const initialRef = React.useRef(null)
  const navigate = useNavigate()

  const onSubmit = () => {
    const id = "임시"
    navigate(`/novels/${id}`)
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
