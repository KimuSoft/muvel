import React from "react"
import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  Hide,
  HStack,
  IconButton,
  Skeleton,
  SkeletonText,
  Spacer,
  Tag,
  TagCloseButton,
  TagLabel,
  TagRightIcon,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react"
import Header from "../organisms/Header"
import { Novel } from "../../types/novel.type"
import TagChip from "../atoms/TagChip"
import {
  TbPlayerPlay,
  TbPlus,
  TbShare,
  TbSortAscendingNumbers,
  TbSortDescendingNumbers,
} from "react-icons/tb"
import EpisodeItem from "../organisms/EpisodeItem"
import { NovelDetailPageSkeleton } from "../pages/NovelDetailPage"
import CreateOrUpdateNovel from "../organisms/CreateOrUpdateNovel"

const NovelDetailTemplate: React.FC<{
  novel: Novel
  isLoading: boolean
  updateNovelHandler(): Promise<unknown>
  createNovelHandler(): Promise<unknown>
}> = ({ novel, updateNovelHandler, createNovelHandler, isLoading }) => {
  const [sort, setSort] = React.useState<1 | -1>(1)

  return (
    <VStack w={"100vw"} gap={12} pb={100}>
      <Header logo={true} />
      <Center
        w={"100%"}
        h={"540px"}
        background={useColorModeValue(
          "linear-gradient(90deg, var(--chakra-colors-gray-200) 0%, var(--chakra-colors-purple-200)  100%)",
          "linear-gradient(90deg, rgba(24, 24, 27) 0%, #434145 100%)"
        )}
      >
        <Container w={"80%"} maxW={"900px"}>
          <HStack gap={10}>
            <VStack w={"100%"} alignItems={"baseline"} gap={3}>
              {!isLoading ? (
                <>
                  <HStack gap={4}>
                    <Heading>{novel.title}</Heading>
                    <Text flexShrink={0} color={"gray.500"}>
                      {novel.episodeIds.length}편
                    </Text>
                  </HStack>
                  <HStack gap={1}>
                    {novel.tags.map((tag) => (
                      <TagChip>{tag}</TagChip>
                    ))}
                    <Tag
                      size={"sm"}
                      borderRadius={"full"}
                      cursor={"pointer"}
                      _hover={{
                        backgroundColor: useColorModeValue(
                          "gray.200",
                          "gray.700"
                        ),
                      }}
                      userSelect={"none"}
                      transition={"background-color 0.2s"}
                    >
                      {!novel.tags.length ? (
                        <TagLabel>태그 추가</TagLabel>
                      ) : null}
                      <TagRightIcon as={TbPlus} />
                    </Tag>
                  </HStack>
                  <Text my={7} textIndent={"15px"}>
                    {novel.description}
                  </Text>
                  <HStack gap={3}>
                    <Button
                      variant={"outline"}
                      leftIcon={<TbPlayerPlay />}
                      disabled={isLoading}
                    >
                      1편부터 보기
                    </Button>
                    <CreateOrUpdateNovel
                      novel={novel}
                      onCreateOrUpdate={updateNovelHandler}
                    />
                    <Button
                      colorScheme={"purple"}
                      variant={"outline"}
                      leftIcon={<TbShare />}
                      disabled={isLoading}
                    >
                      공유 설정
                    </Button>
                  </HStack>
                </>
              ) : (
                <>
                  <SkeletonText
                    minW={"200px"}
                    w={"80%"}
                    maxW={"450px"}
                    noOfLines={1}
                    skeletonHeight={10}
                  />
                  <SkeletonText w={"100px"} noOfLines={1} skeletonHeight={5} />
                  <SkeletonText
                    minW={"200px"}
                    w={"100%"}
                    my={7}
                    noOfLines={3}
                    skeletonHeight={5}
                  />
                </>
              )}
            </VStack>
            <Hide below={"md"}>
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
              />
            </Hide>
          </HStack>
        </Container>
      </Center>

      <Container w={"80%"} maxW={"900px"} userSelect={"none"}>
        <HStack>
          <Heading size={"md"}>에피소드 목록</Heading>
          <Spacer />
          <Tooltip label={sort === 1 ? "1편부터 정렬" : "최신 편부터 정렬"}>
            <IconButton
              aria-label={"에피소드 추가"}
              variant="ghost"
              onClick={() => setSort(sort === 1 ? -1 : 1)}
              icon={
                sort === 1 ? (
                  <TbSortAscendingNumbers
                    size={24}
                    color={"var(--chakra-colors-purple-400)"}
                  />
                ) : (
                  <TbSortDescendingNumbers
                    size={24}
                    color={"var(--chakra-colors-purple-400)"}
                  />
                )
              }
            />
          </Tooltip>
          <Button
            colorScheme={"purple"}
            leftIcon={<TbPlus />}
            disabled={isLoading}
            onClick={createNovelHandler}
          >
            새 편 쓰기
          </Button>
        </HStack>
        <VStack gap={1} py={5} alignItems={"baseline"}>
          {!isLoading ? (
            // TODO: 임시조치
            (sort === 1 ? novel.episodes : novel.episodes.reverse()).map(
              (episode, idx) => (
                <EpisodeItem
                  episode={episode}
                  index={sort === 1 ? idx : novel.episodes.length - idx - 1}
                />
              )
            )
          ) : (
            <>
              <NovelDetailPageSkeleton />
              <NovelDetailPageSkeleton />
              <NovelDetailPageSkeleton />
              <NovelDetailPageSkeleton />
              <NovelDetailPageSkeleton />
            </>
          )}
        </VStack>
      </Container>
    </VStack>
  )
}

export default NovelDetailTemplate
