import React, { useEffect, useState } from "react"
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Link,
  Spacer,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react"
import { RiQuillPenFill } from "react-icons/ri"
import Header from "../../components/organisms/Header"
import type { Novel } from "muvel-api-types"
import { FaBookBookmark } from "react-icons/fa6"
import SortableNovelGrid from "~/features/my-novels/components/SortableNovelGrid"
import { useUser } from "~/context/UserContext"
import CreateNovelModal from "~/components/modals/CreateNovelModal"

const MyNovelsTemplates: React.FC<{
  novels: Novel[]
}> = ({ novels }) => {
  const [innerWidth, setInnerWidth] = useState(0)
  const user = useUser()

  useEffect(() => {
    const resizeListener = () => {
      setInnerWidth(window.innerWidth)
    }
    window.addEventListener("resize", resizeListener)
  })

  const column = useBreakpointValue({ base: 1, md: 2, lg: 3 })

  const loginClickHandler = () => {
    window.location.href = "api/auth/login"
  }

  return (
    <VStack w={"100vw"}>
      <Header />
      <Container maxW={"4xl"} my={100} px={3}>
        {user && (
          <>
            <HStack w={"100%"} gap={3} mb={5} px={3}>
              <FaBookBookmark size={16} />
              <Heading fontSize={"md"}>{user?.username}의 소설 목록</Heading>
              <Text fontSize={"sm"} color={"gray.500"}>
                ({novels.length}개)
              </Text>
              <Spacer />
              <CreateNovelModal>
                <Button
                  gap={2.5}
                  size={"sm"}
                  colorScheme="purple"
                  flexShrink={0}
                >
                  <RiQuillPenFill />
                  <Box display={{ base: "none", md: "block" }}>
                    새 소설 쓰기
                  </Box>
                </Button>
              </CreateNovelModal>
            </HStack>
          </>
        )}

        {novels.length && user ? (
          <SortableNovelGrid novels={novels} column={column} />
        ) : user ? (
          <Text color={"gray.500"} textAlign={"center"}>
            소설이 없네요...
            <br />
            오른쪽 위의 깃펜 모양의 버튼을 눌러 새 소설을 써 보세요!{" "}
            {JSON.stringify(user)}
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
        )}
      </Container>
    </VStack>
  )
}

export default MyNovelsTemplates
