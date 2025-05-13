import React, { useMemo } from "react"
import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  HStack,
  Image,
  type MenuSelectionDetails,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import Header from "../organisms/Header"
import {
  EpisodeType,
  type GetNovelResponseDto,
  ShareType,
} from "muvel-api-types"
import { TbEdit, TbPencilPlus, TbPlayerPlay, TbShare } from "react-icons/tb"
import NovelTagList from "../organisms/NovelTagList"
import { useNavigate, useRevalidator } from "react-router"
import SortableEpisodeList, {
  type SortDirection,
} from "../organisms/SortableEpisodeList"
import ModifyNovelModal from "~/components/modals/ModifyNovelModal"
import { FaList } from "react-icons/fa6"
import BlockLink from "~/components/atoms/BlockLink"
import type { ReorderedEpisode } from "~/utils/reorderEpisode"
import { toaster } from "~/components/ui/toaster"
import SortToggleButton from "~/components/atoms/SortToggleButton"
import EpisodeListLayoutToggleButton from "~/components/atoms/EpisodeListLayoutToggleButton"
import type { EpisodeItemVariant } from "~/components/molecules/EpisodeItem"
import type { GetLocalNovelDetailsResponse } from "~/services/tauri/types"
import { updateNovel, updateNovelEpisodes } from "~/services/novelService"
import { createNovelEpisode } from "~/services/episodeService"
import CreateEpisodeMenu from "~/features/novel-editor/components/menus/CreateEpisodeMenu"
import { getKimuageUrl } from "~/utils/getKimuageUrl"

const NovelDetailTemplate: React.FC<{
  novel: GetNovelResponseDto | GetLocalNovelDetailsResponse
}> = ({ novel }) => {
  const { revalidate } = useRevalidator()
  const navigate = useNavigate()
  const [isEpisodesLoading, setIsEpisodesLoading] = React.useState(false)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc")
  const [episodeListLayout, setEpisodeListLayout] =
    React.useState<EpisodeItemVariant>("detail")

  const handleCreateEpisode = async (detail: MenuSelectionDetails) => {
    const episode = await createNovelEpisode(novel.id, {
      episodeType: parseInt(detail.value) as EpisodeType,
    })
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
      case ShareType.Local:
        return "로컬"
    }
  }, [novel.share])

  return (
    <VStack gap={12} pb={100}>
      <Header logo={true} />
      <Center
        w={"100%"}
        h={"100%"}
        py={8}
        position="relative"
        overflow={"hidden"}
      >
        {novel.thumbnail ? (
          <Box
            position="absolute"
            w={"100%"}
            h={"100%"}
            inset={0}
            backgroundImage={`url(${getKimuageUrl(novel.thumbnail)})`}
            backgroundSize="cover"
            backgroundPosition="center"
            transform={"scale(1.2)"}
            filter="blur(40px)"
            zIndex={0}
            _after={{
              content: `""`,
              position: "absolute",
              inset: 0,
              bg: "rgba(255, 255, 255, 0.4)", // optional: 밝기 조정
              _dark: { bg: "rgba(0, 0, 0, 0.4)" },
            }}
          />
        ) : (
          // 기본 그라디언트 배경
          <Box
            position="absolute"
            w={"100%"}
            h={"100%"}
            inset={0}
            background={{
              base: "linear-gradient(90deg, var(--chakra-colors-gray-200) 0%, var(--chakra-colors-gray-300)  100%)",
              _dark:
                "linear-gradient(90deg, rgba(24, 24, 27) 0%, #434145 100%)",
            }}
            zIndex={0}
          />
        )}

        <Container w={"100%"} maxW={"4xl"} px={5} mt={10}>
          <HStack
            minH={"300px"}
            gap={{ base: 5, md: 8 }}
            flexDir={{ base: "column", md: "row-reverse" }}
            alignItems={{ base: "flex-start", md: "center" }}
          >
            {novel.thumbnail && (
              <Image
                w={{ base: "120px", md: "260px" }}
                h={{ base: "180px", md: "390px" }}
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
            )}

            <VStack w={"100%"} alignItems={"baseline"}>
              <HStack rowGap={1} columnGap={4} flexWrap={"wrap"}>
                <Heading
                  fontSize={{ base: "16px", md: "40px" }}
                  lineHeight={1.4}
                >
                  {novel.title}
                </Heading>
                <Text
                  flexShrink={0}
                  color={{ base: "gray.700", _dark: "gray.300" }}
                  fontSize={{ base: "xs", md: "md" }}
                >
                  {novel.episodeCount}편 · {shareText}
                </Text>
              </HStack>
              <NovelTagList
                tags={novel.tags}
                editable={novel.permissions.edit}
                onChange={async (tags) => {
                  await updateNovel(novel, { tags })
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
                {[ShareType.Unlisted, ShareType.Public].includes(
                  novel.share,
                ) && (
                  <Button
                    gap={2.5}
                    flexShrink={0}
                    size={"sm"}
                    variant={"subtle"}
                    onClick={async () => {
                      await navigator.clipboard.writeText(window.location.href)
                      toaster.success({
                        title: "링크가 복사되었습니다.",
                        description:
                          "보여주고 싶은 사람한테 링크를 보내보세요!",
                      })
                    }}
                  >
                    <TbShare />
                    <Box display={{ base: "none", md: "block" }}>공유하기</Box>
                  </Button>
                )}
              </HStack>
            </VStack>
          </HStack>
        </Container>
      </Center>

      <Container w={"100%"} maxW={"4xl"} userSelect={"none"}>
        <HStack gap={3} mb={4} px={1}>
          <FaList />
          <Heading size={"md"} flexShrink={0}>
            에피소드 목록
          </Heading>
          {novel.permissions.edit && (
            <Text
              display={{
                base: "none",
                md: "block",
              }}
              ml={2}
              fontSize={"xs"}
              color={"gray.500"}
            >
              잡은 후 드래그하면 순서를 바꿀 수 있어요!
            </Text>
          )}
          <Spacer />

          <HStack gap={1}>
            <EpisodeListLayoutToggleButton
              variants={["detail", "simple"]}
              onValueChange={setEpisodeListLayout}
              value={episodeListLayout}
            />
            <SortToggleButton
              value={sortDirection}
              onValueChange={setSortDirection}
            />
          </HStack>
          {novel.permissions.edit ? (
            <CreateEpisodeMenu onSelect={handleCreateEpisode}>
              <Button
                colorPalette={"purple"}
                gap={3}
                rounded={{ base: "full", md: 5 }}
                size={"sm"}
                loading={isEpisodesLoading}
              >
                <TbPencilPlus />
                <Box display={{ base: "none", md: "block" }}>새 편 쓰기</Box>
              </Button>
            </CreateEpisodeMenu>
          ) : null}
        </HStack>
        <SortableEpisodeList
          sortDirection={sortDirection}
          loading={isEpisodesLoading}
          episodes={novel.episodes}
          variant={episodeListLayout}
          onEpisodesChange={handleReorderEpisode}
        />
      </Container>
    </VStack>
  )
}

export default NovelDetailTemplate
