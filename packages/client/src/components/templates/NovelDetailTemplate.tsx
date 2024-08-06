import React from "react"
import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  Heading,
  Hide,
  HStack,
  SkeletonText,
  Spacer,
  Text,
  useColorModeValue,
  useDisclosure,
  useMediaQuery,
  VStack,
} from "@chakra-ui/react"
import Header from "../organisms/Header"
import { Novel } from "../../types/novel.type"
import { TbEdit, TbPlayerPlay, TbPlus, TbShare } from "react-icons/tb"
import ModifyNovelModal from "../organisms/forms/ModifyNovelModal"
import NovelTagList from "../organisms/NovelTagList"
import { useNavigate } from "react-router-dom"
import SortableEpisodeList2 from "../organisms/SortableEpisodeList2"

const NovelDetailTemplate: React.FC<{
  novel: Novel
  isLoading: boolean
  updateNovelHandler(): Promise<unknown>
  createNovelHandler(): Promise<unknown>
  changeTagsHandler(values: string[]): Promise<unknown>
  editable: boolean
}> = ({
  novel,
  updateNovelHandler,
  createNovelHandler,
  isLoading,
  changeTagsHandler,
  editable,
}) => {
  const navigate = useNavigate()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isSortOpen,
    onOpen: onSortOpen,
    onClose: onSortClose,
  } = useDisclosure()

  const [sort, setSort] = React.useState<1 | -1>(1)
  const [isPC] = useMediaQuery("(min-width: 800px)")

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
        <Container w={"90%"} maxW={"900px"}>
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
                  <NovelTagList
                    tags={novel.tags}
                    editable={editable}
                    onChange={changeTagsHandler}
                  />
                  <Text my={7} textIndent={"15px"}>
                    {novel.description}
                  </Text>
                  <HStack gap={3}>
                    <Button
                      variant={"outline"}
                      leftIcon={<TbPlayerPlay />}
                      disabled={isLoading}
                      onClick={() =>
                        navigate(
                          `/episodes/${
                            novel.episodes.find((e) => e.order === "1")?.id
                          }`
                        )
                      }
                    >
                      1편부터 보기
                    </Button>
                    {editable ? (
                      <Button
                        gap={2.5}
                        colorScheme="purple"
                        flexShrink={0}
                        variant={"outline"}
                        onClick={onOpen}
                      >
                        <TbEdit /> <Hide below={"md"}> 소설 수정하기</Hide>
                      </Button>
                    ) : null}

                    <ModifyNovelModal
                      isOpen={isOpen}
                      onClose={onClose}
                      novel={novel}
                      onModify={updateNovelHandler}
                    />

                    {editable ? (
                      <Button
                        colorScheme={"purple"}
                        variant={"outline"}
                        disabled={isLoading}
                        gap={3}
                      >
                        <TbShare />
                        {isPC ? "공유 설정" : null}
                      </Button>
                    ) : null}
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
              disabled={isLoading}
              onClick={createNovelHandler}
              size={"sm"}
            >
              <TbPlus />
              {isPC ? "새 편 쓰기" : null}
            </Button>
          ) : null}
        </HStack>
        <Divider mb={5} />
        <SortableEpisodeList2 novel={novel} isLoading={isLoading} />
      </Container>
    </VStack>
  )
}

export default NovelDetailTemplate
