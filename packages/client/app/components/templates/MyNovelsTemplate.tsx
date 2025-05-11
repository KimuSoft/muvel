import React from "react"
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import { RiQuillPenFill } from "react-icons/ri"
import Header from "../organisms/Header"
import type { Novel } from "muvel-api-types"
import { FaBookBookmark } from "react-icons/fa6"
import SortableNovelGrid from "~/components/organisms/SortableNovelGrid"
import { useUser } from "~/context/UserContext"
import CreateNovelDialog from "~/components/modals/CreateNovelDialog"
import NovelEmptyState from "~/components/molecules/NovelEmptyState"
import LoadingOverlay from "~/components/templates/LoadingOverlay"
import type { LocalNovelData } from "~/services/tauri/types"
import { usePlatform } from "~/hooks/usePlatform"

const MyNovelsTemplate: React.FC<{
  novels: (Novel | LocalNovelData)[]
}> = ({ novels }) => {
  const user = useUser()
  const { isTauri } = usePlatform()

  if (!user && !isTauri) {
    // 타우리 환경에서는 로그인 페이지로 리다이렉트 하지 않음 (오프라인 가능)
    window.location.href = "/api/auth/login"
    return <LoadingOverlay />
  }

  return (
    <VStack w={"100vw"}>
      <Header />
      <Container maxW={"6xl"} my={100} px={3}>
        <>
          <HStack w={"100%"} gap={3} mb={5} px={3}>
            <FaBookBookmark size={16} />
            <Heading fontSize={"md"}>
              {user?.username || "나"}의 소설 목록
            </Heading>
            <Text fontSize={"sm"} color={"gray.500"}>
              ({novels.length}개)
            </Text>
            <Spacer />
            <CreateNovelDialog>
              <Button gap={2.5} size={"sm"} colorScheme="purple" flexShrink={0}>
                <RiQuillPenFill />
                <Box display={{ base: "none", md: "block" }}>새 소설 쓰기</Box>
              </Button>
            </CreateNovelDialog>
          </HStack>
        </>

        {novels.length ? (
          <SortableNovelGrid novels={novels} />
        ) : (
          <NovelEmptyState />
        )}
      </Container>
    </VStack>
  )
}

export default MyNovelsTemplate
