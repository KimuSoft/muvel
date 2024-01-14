import React, { useEffect, useMemo, useState } from "react"
import {
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  SimpleGrid,
  Text,
  useMediaQuery,
  VStack,
} from "@chakra-ui/react"
import { RiQuillPenFill } from "react-icons/ri"
import Header from "../organisms/Header"
import { BiSearch } from "react-icons/bi"
import NovelItem from "../organisms/main/NovelItem"
import { Novel } from "../../types/novel.type"
import { User } from "../../types/user.type"
import NovelItemSkeleton from "../organisms/main/NovelItemSkeleton"
import CreateOrUpdateNovel from "../organisms/CreateOrUpdateNovel"

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

  const loginClickHandler = () => {
    window.location.href = import.meta.env.VITE_API_BASE + "/auth/login"
  }

  return (
    <VStack w={"100vw"}>
      <Header logo={false} />
      <VStack
        w={isPC ? "80%" : "100%"}
        maxW={"1200px"}
        gap={10}
        my={100}
        px={3}
      >
        <MainLogo />
        <HStack w={isPC ? "80%" : "100%"} maxW="700px" mb={10}>
          <InputGroup w={"100%"}>
            <Input
              placeholder="내 소설 검색하기"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <InputRightElement>
              <BiSearch />
            </InputRightElement>
          </InputGroup>
          <CreateOrUpdateNovel />
        </HStack>
        {!isLoading ? (
          novels.length ? (
            searchedNovels.length ? (
              <SimpleGrid
                w={"100%"}
                columns={column}
                gridColumnGap={4}
                gridRowGap={0}
              >
                {searchedNovels.map((novel) => (
                  <NovelItem novel={novel} key={novel.id} />
                ))}
              </SimpleGrid>
            ) : (
              <Text color={"gray.500"}>
                '{searchQuery}'이(가) 들어가는 소설은 없네요...
              </Text>
            )
          ) : user ? (
            <Text color={"gray.500"} textAlign={"center"}>
              소설이 없네요...
              <br />
              오른쪽 위의 깃펜 모양의 버튼을 눌러 새 소설을 써 보세요!
            </Text>
          ) : (
            <Text color={"gray.500"} textAlign={"center"}>
              소설이 없네요...
              <br />
              뮤블에{" "}
              <Link
                fontWeight={"800"}
                color={"purple.500"}
                onClick={loginClickHandler}
              >
                로그인
              </Link>
              해서 저랑 같이 새 소설을 써 보아요!
            </Text>
          )
        ) : (
          <SimpleGrid w={"100%"} columns={column} gap={2}>
            <NovelItemSkeleton />
            <NovelItemSkeleton />
            <NovelItemSkeleton />
            <NovelItemSkeleton />
            <NovelItemSkeleton />
            <NovelItemSkeleton />
          </SimpleGrid>
        )}
      </VStack>
    </VStack>
  )
}

export default MainTemplate
