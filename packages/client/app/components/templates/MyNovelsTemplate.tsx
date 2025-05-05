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

const MyNovelsTemplate: React.FC<{
  novels: Novel[]
}> = ({ novels }) => {
  const user = useUser()

  if (!user) {
    window.location.href = "/api/auth/login"
    return <LoadingOverlay />
  }

  return (
    <VStack w={"100vw"}>
      <Header />
      <Container maxW={"6xl"} my={100} px={3}>
        {user && (
          <>
            <HStack w={"100%"} gap={3} mb={5} px={3}>
              <FaBookBookmark size={16} />
              <Heading fontSize={"md"}>{user?.username}의 소설 목록</Heading>
              <Text fontSize={"sm"} color={"gray.500"}>
                ({novels.length}개)
              </Text>
              <Spacer />
              <CreateNovelDialog>
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
              </CreateNovelDialog>
            </HStack>
          </>
        )}

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
