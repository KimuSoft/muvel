import React from "react"
import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  HStack,
  Separator,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import Header from "../organisms/Header"
import type { Novel } from "~/types/novel.type"
import { TbEdit, TbPlayerPlay, TbPlus, TbShare } from "react-icons/tb"
import NovelTagList from "../organisms/NovelTagList"
import { useNavigate, useRevalidator } from "react-router"
import SortableEpisodeList2 from "../organisms/SortableEpisodeList2"
import ModifyNovelModal from "~/components/modals/ModifyNovelModal"

const NovelDetailTemplate: React.FC<{
  novel: Novel
  editable: boolean
}> = ({ novel, editable }) => {
  const navigate = useNavigate()
  const { revalidate } = useRevalidator()

  return (
    <VStack w={"100vw"} gap={12} pb={100}>
      <Header logo={true} />
      <Center
        w={"100%"}
        h={"540px"}
        background={{
          base: "linear-gradient(90deg, var(--chakra-colors-gray-200) 0%, var(--chakra-colors-purple-200)  100%)",
          _dark: "linear-gradient(90deg, rgba(24, 24, 27) 0%, #434145 100%)",
        }}
      >
        <Container w={"90%"} maxW={"900px"}>
          <HStack gap={10}>
            <VStack w={"100%"} alignItems={"baseline"} gap={3}>
              <HStack gap={4}>
                <Heading>{novel.title}</Heading>
                <Text flexShrink={0} color={"gray.500"}>
                  {novel.episodeIds.length}편
                </Text>
              </HStack>
              <NovelTagList
                tags={novel.tags}
                editable={editable}
                onChange={revalidate}
              />
              <Text my={7} textIndent={"15px"}>
                {novel.description}
              </Text>
              <HStack gap={3}>
                <Button
                  variant={"outline"}
                  onClick={() =>
                    navigate(
                      `/episodes/${
                        novel.episodes.find((e) => e.order === "1")?.id
                      }`,
                    )
                  }
                >
                  <TbPlayerPlay /> 1편부터 보기
                </Button>
                {editable ? (
                  <ModifyNovelModal novel={novel} onModify={revalidate}>
                    <Button
                      gap={2.5}
                      colorScheme="purple"
                      flexShrink={0}
                      variant={"outline"}
                    >
                      <TbEdit />
                      <Box display={{ base: "none", md: "block" }}>
                        소설 수정하기
                      </Box>
                    </Button>
                  </ModifyNovelModal>
                ) : null}

                {editable ? (
                  <Button colorScheme={"purple"} variant={"outline"} gap={3}>
                    <TbShare />
                    <Box display={{ base: "none", md: "block" }}>공유하기</Box>
                  </Button>
                ) : null}
              </HStack>
            </VStack>
            <Box
              w="260px"
              h="390px"
              borderRadius="14px"
              backgroundColor={"gray.500"}
              backgroundImage={novel.thumbnail || ""}
              backgroundRepeat={"no-repeat"}
              backgroundSize={"cover"}
              backgroundPosition={"center"}
              boxShadow={"0px 4px 30px 1px rgba(0, 0, 0, 0.25)"}
              flexShrink={0}
              display={{ base: "none", md: "block" }}
            />
          </HStack>
        </Container>
      </Center>

      <Container w={"100%"} maxW={"900px"} userSelect={"none"}>
        <HStack mb={3} px={3}>
          <Heading size={"md"}>에피소드 목록</Heading>
          <Spacer />
          {/*<Tooltip label={sort === 1 ? "1편부터 정렬" : "최신 편부터 정렬"}>*/}
          {/*  <IconButton*/}
          {/*    aria-label={"에피소드 추가"}*/}
          {/*    variant="ghost"*/}
          {/*    onClick={() => setSort(sort === 1 ? -1 : 1)}*/}
          {/*    icon={*/}
          {/*      sort === 1 ? (*/}
          {/*        <TbSortAscendingNumbers*/}
          {/*          size={24}*/}
          {/*          color={"var(--chakra-colors-purple-400)"}*/}
          {/*        />*/}
          {/*      ) : (*/}
          {/*        <TbSortDescendingNumbers*/}
          {/*          size={24}*/}
          {/*          color={"var(--chakra-colors-purple-400)"}*/}
          {/*        />*/}
          {/*      )*/}
          {/*    }*/}
          {/*  />*/}
          {/*</Tooltip>*/}

          {editable ? (
            <Button
              colorScheme={"purple"}
              gap={3}
              onClick={revalidate}
              size={"sm"}
            >
              <TbPlus />
              <Box display={{ base: "none", md: "block" }}>새 편 쓰기</Box>
            </Button>
          ) : null}
        </HStack>
        <Separator mb={5} />
        <SortableEpisodeList2 novel={novel} />
      </Container>
    </VStack>
  )
}

export default NovelDetailTemplate
