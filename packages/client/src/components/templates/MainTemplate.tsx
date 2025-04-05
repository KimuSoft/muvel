import React, { useEffect, useMemo, useState } from "react"
import {
  Button,
  Center,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  useColorModeValue,
  useMediaQuery,
  VStack,
} from "@chakra-ui/react"
import { RiQuillPenFill } from "react-icons/ri"
import Header from "../organisms/Header"
import { BiSearch } from "react-icons/bi"
import { Novel } from "../../types/novel.type"
import { User } from "../../types/user.type"
import { useNavigate } from "react-router-dom"
import { FaPenFancy } from "react-icons/fa"

const MainLogo: React.FC = () => {
  return (
    <VStack userSelect="none">
      <HStack gap={3}>
        <RiQuillPenFill size={50} />
        <Heading size="3xl">Muvel</Heading>
      </HStack>
      <Text letterSpacing={7} fontSize={"xs"}>
        당신의 이야기를 담은 작은 방
      </Text>
    </VStack>
  )
}

const MainTemplate: React.FC<{
  user: User | null
  novels: Novel[]
  isLoading: boolean
}> = ({ user, novels, isLoading }) => {
  const [innerWidth, setInnerWidth] = useState(window.innerWidth)
  const [isPC] = useMediaQuery("(min-width: 800px)")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const navigate = useNavigate()

  const searchedNovels = useMemo(() => {
    if (searchQuery === "") return novels
    return novels.filter((novel) => novel.title.includes(searchQuery))
  }, [searchQuery, novels])

  useEffect(() => {
    const resizeListener = () => {
      setInnerWidth(window.innerWidth)
    }
    window.addEventListener("resize", resizeListener)
  })

  const column = useMemo(() => {
    if (innerWidth > 1350) return 3
    if (innerWidth > 1000) return 2
    return 1
  }, [innerWidth])

  return (
    <VStack w={"100vw"} h={"100vh"} px={3}>
      <Header logo={false} />
      <Center
        flexDir={"column"}
        w={"100%"}
        h={"100%"}
        maxW={"1200px"}
        gap={10}
        my={100}
        px={3}
      >
        <MainLogo />
        <Stack w={isPC ? "700px" : "100%"} flexDir={isPC ? "row" : "column"}>
          <InputGroup>
            <Input
              bgColor={useColorModeValue("gray.200", "gray.700")}
              borderColor={useColorModeValue("gray.200", "gray.700")}
              placeholder="소설 검색하기 (작동 안 함)"
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return
                navigate("/search?q=" + searchQuery)
              }}
            />
            <InputRightElement>
              <BiSearch />
            </InputRightElement>
          </InputGroup>
          <Button
            flexShrink={0}
            colorScheme={"purple"}
            leftIcon={<FaPenFancy />}
            onClick={() => navigate("/my-novels")}
          >
            내 소설 쓰러가기
          </Button>
        </Stack>
      </Center>
    </VStack>
  )
}

export default MainTemplate
