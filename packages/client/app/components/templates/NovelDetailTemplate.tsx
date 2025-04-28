import React, { useMemo } from "react"
import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  HStack,
  Image,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import Header from "../organisms/Header"
import { type GetNovelResponseDto, ShareType } from "muvel-api-types"
import { TbEdit, TbPlayerPlay, TbPlus } from "react-icons/tb"
import NovelTagList from "../organisms/NovelTagList"
import { useNavigate, useRevalidator } from "react-router"
import SortableEpisodeList from "../organisms/SortableEpisodeList"
import ModifyNovelModal from "~/components/modals/ModifyNovelModal"
import { FaList } from "react-icons/fa6"
import BlockLink from "~/components/atoms/BlockLink"
import {
  createNovelEpisode,
  updateNovel,
  updateNovelEpisodes,
} from "~/api/api.novel"
import type { ReorderedEpisode } from "~/utils/reorderEpisode"

const NovelDetailTemplate: React.FC<{
  novel: GetNovelResponseDto
}> = ({ novel }) => {
  const { revalidate } = useRevalidator()
  const navigate = useNavigate()
  const [isEpisodesLoading, setIsEpisodesLoading] = React.useState(false)

  const handleCreateEpisode = async () => {
    setIsEpisodesLoading(true)
    const episode = await createNovelEpisode(novel.id)
    navigate(`/episodes/${episode.id}`)
  }

  const handleReorderEpisode = async (episodes: ReorderedEpisode[]) => {
    setIsEpisodesLoading(true)
    await updateNovelEpisodes(
      novel.id,
      episodes
        .filter((e) => e.isReordered)
        .map((e) => ({ id: e.id, order: e.order })),
    )
    await revalidate()
    setIsEpisodesLoading(false)
  }

  const shareText = useMemo(() => {
    switch (novel.share) {
      case ShareType.Private:
        return "비공개"
      case ShareType.Unlisted:
        return "일부 공개"
      case ShareType.Public:
        return "공개"
    }
  }, [novel.share])

  return (
    <VStack w={"100vw"} gap={12} pb={100}>
      <Header logo={true} />
      <Center
        w={"100%"}
        py={8}
        background={{
          base: "linear-gradient(90deg, var(--chakra-colors-gray-200) 0%, var(--chakra-colors-gray-300)  100%)",
          _dark: "linear-gradient(90deg, rgba(24, 24, 27) 0%, #434145 100%)",
        }}
      >
        <Container w={"100%"} px={5} mt={10} maxW={"4xl"}>
          <HStack
            gap={{ base: 5, md: 8 }}
            flexDir={{ base: "row", md: "row-reverse" }}
          >
            <Image
              w={{ base: "130px", md: "260px" }}
              h={{ base: "195px", md: "390px" }}
              borderRadius="md"
              bgColor={{ base: "gray.100", _dark: "gray.700" }}
              src={
                novel.thumbnail
                  ? `${novel.thumbnail}/thumbnail?width=260`
                  : "/cover.png"
              }
              backgroundRepeat={"no-repeat"}
              backgroundSize={"cover"}
              backgroundPosition={"center"}
              boxShadow={"md"}
              flexShrink={0}
            />
            <VStack w={"100%"} alignItems={"baseline"}>
              <HStack rowGap={1} columnGap={5} flexWrap={"wrap"}>
                <Heading
                  fontSize={{ base: "16px", md: "40px" }}
                  lineHeight={1.4}
                >
                  {novel.title}
                </Heading>
                <Text
                  flexShrink={0}
                  color={"gray.500"}
                  fontSize={{ base: "sm", md: "md" }}
                >
                  {novel.episodeCount}편 · {shareText}
                </Text>
              </HStack>
              <NovelTagList
                tags={novel.tags}
                editable={novel.permissions.edit}
                onChange={async (tags) => {
                  await updateNovel({ id: novel.id, tags })
                  await revalidate()
                }}
              />
              {novel.description ? (
                <Text
                  fontSize={"14px"}
                  lineHeight={1.5}
                  my={{ base: 0, md: 3 }}
                >
                  {novel.description}
                </Text>
              ) : null}

              <HStack gap={2} mt={4}>
                <BlockLink
                  to={`/episodes/${
                    novel.episodes.find((e) => e.order == 1)?.id
                  }`}
                >
                  <Button size={"sm"} colorPalette={"purple"}>
                    <TbPlayerPlay /> 처음부터 보기
                  </Button>
                </BlockLink>
                {novel.permissions.edit ? (
                  <ModifyNovelModal novel={novel} onModify={revalidate}>
                    <Button
                      gap={2.5}
                      flexShrink={0}
                      size={"sm"}
                      variant={"subtle"}
                    >
                      <TbEdit />
                      <Box display={{ base: "none", md: "block" }}>
                        수정하기
                      </Box>
                    </Button>
                  </ModifyNovelModal>
                ) : null}

                {/*{novel.permissions.edit ? (*/}
                {/*  <Button size={"sm"} variant={"subtle"}>*/}
                {/*    <TbShare />*/}
                {/*    <Box display={{ base: "none", md: "block" }}>공유하기</Box>*/}
                {/*  </Button>*/}
                {/*) : null}*/}
              </HStack>
            </VStack>
          </HStack>
        </Container>
      </Center>

      <Container w={"100%"} maxW={"4xl"} userSelect={"none"}>
        <HStack gap={3} mb={4} px={1}>
          <FaList />
          <Heading size={"md"}>에피소드 목록</Heading>

          <Spacer />

          {novel.permissions.edit ? (
            <Button
              colorScheme={"purple"}
              gap={3}
              size={"sm"}
              loading={isEpisodesLoading}
              onClick={handleCreateEpisode}
            >
              <TbPlus />
              <Box display={{ base: "none", md: "block" }}>새 편 쓰기</Box>
            </Button>
          ) : null}
        </HStack>
        <SortableEpisodeList
          loading={isEpisodesLoading}
          episodes={novel.episodes}
          onEpisodesChange={handleReorderEpisode}
        />
      </Container>
    </VStack>
  )
}

export default NovelDetailTemplate
