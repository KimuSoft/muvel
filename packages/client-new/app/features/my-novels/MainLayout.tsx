import React, { useEffect, useMemo, useState } from "react"
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Link,
  Separator,
  SimpleGrid,
  Skeleton,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import { RiQuillPenFill } from "react-icons/ri"
import Header from "../../components/organisms/Header"
import type { Novel } from "~/types/novel.type"
import type { User } from "~/types/user.type"
import { FaBookBookmark } from "react-icons/fa6"
import SortableNovelGrid from "~/features/my-novels/components/SortableNovelGrid"

const NovelItemSkeleton: React.FC = () => {
  return <Skeleton rounded={5} w={"100%"} h={"160px"} minW={"350px"} />
}

const MainLayout: React.FC<{
  user: User
  novels: Novel[]
  isLoading: boolean
}> = ({ user, novels, isLoading }) => {
  const [innerWidth, setInnerWidth] = useState(window.innerWidth)

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
      <Header />
      <Container maxW={"3xl"} my={100} px={3}>
        <HStack w={"100%"} gap={3} mb={3} px={3}>
          <FaBookBookmark size={18} />
          <Heading fontSize={"xl"}>{user.username}의 소설 목록</Heading>
          <Text fontSize={"md"} color={"gray.500"}>
            ({novels.length}개)
          </Text>
          <Spacer />
          <Button
            gap={2.5}
            size={"sm"}
            colorScheme="purple"
            onClick={onOpen}
            flexShrink={0}
            variant={"outline"}
          >
            <RiQuillPenFill />
            <Box display={{ base: "none", md: "block" }}>새 소설 쓰기</Box>
          </Button>
          {/*<CreateNovelModal isOpen={isOpen} onClose={onClose} />*/}
        </HStack>
        <Separator mb={5} />
        {!isLoading ? (
          novels.length ? (
            <SortableNovelGrid novels={novels} column={column} />
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
      </Container>
    </VStack>
  )
}

export default MainLayout
