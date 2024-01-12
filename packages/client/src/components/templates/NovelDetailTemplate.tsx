import React from "react"
import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  HStack,
  IconButton,
  Skeleton,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import Header from "../organisms/Header"
import { Novel } from "../../types/novel.type"
import TagChip from "../atoms/TagChip"
import {
  TbEdit,
  TbPlayerPlay,
  TbPlus,
  TbShare,
  TbSortAscendingLetters,
} from "react-icons/tb"
import EpisodeItem from "../organisms/EpisodeItem"
import { NovelDetailPageSkeleton } from "../pages/NovelDetailPage"

const NovelDetailTemplate: React.FC<{ novel: Novel; isLoading: boolean }> = ({
  novel,
  isLoading,
}) => {
  return (
    <VStack w={"100vw"} gap={12} pb={100}>
      <Header logo={true} />
      <Center
        w={"100%"}
        h={"540px"}
        background={
          "linear-gradient(90deg, rgba(24, 24, 27, 0.26) 0%, #434145 100.92%)"
        }
      >
        <Container w={"80%"} maxW={"900px"}>
          <HStack gap={10}>
            <VStack w={"100%"} alignItems={"baseline"} gap={3}>
              <HStack gap={4}>
                <Heading>로리 용 법사로 살아가기</Heading>
                <Text flexShrink={0} color={"gray.500"}>
                  18편
                </Text>
              </HStack>
              <HStack gap={1}>
                <TagChip>현대</TagChip>
                <TagChip>판타지</TagChip>
                <TagChip>TS</TagChip>
              </HStack>
              <Text my={7} textIndent={"15px"}>
                어느 날 트럭에 치여버린 용덕후 남자 고등학생. 용이 정말 좋아서,
                용으로 이세계에 전생하고 싶다고 말하고서 정신을 차려보니 은발
                로리 용 법사가 되어 있었습니다?! ㅡ은발 용 로리 마법사가
                되어버린 주인공의 좌충우돌 스토리!
              </Text>
              <HStack gap={3}>
                <Button variant={"outline"} leftIcon={<TbPlayerPlay />}>
                  1편부터 보기
                </Button>
                <Button
                  colorScheme={"purple"}
                  variant={"outline"}
                  leftIcon={<TbEdit />}
                >
                  작품 정보 수정
                </Button>
                <Button
                  colorScheme={"purple"}
                  variant={"outline"}
                  leftIcon={<TbShare />}
                >
                  공유 설정
                </Button>
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
            />
          </HStack>
        </Container>
      </Center>

      <Container w={"80%"} maxW={"900px"}>
        <HStack>
          <Heading size={"md"}> 에피소드 목록</Heading>
          <Spacer />
          <IconButton
            aria-label={"에피소드 추가"}
            variant="ghost"
            icon={
              <TbSortAscendingLetters
                size={24}
                color={"var(--chakra-colors-purple-500)"}
              />
            }
          />
          <Button colorScheme={"purple"} leftIcon={<TbPlus />}>
            새 편 쓰기
          </Button>
        </HStack>
        <VStack gap={1} py={5} alignItems={"baseline"}>
          {!isLoading ? (
            novel.episodes.map((episode, idx) => (
              <EpisodeItem episode={episode} index={idx} />
            ))
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
