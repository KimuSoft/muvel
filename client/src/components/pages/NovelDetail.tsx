import React, { useEffect } from "react"
import Header from "../organisms/Header"
import { useNavigate, useParams } from "react-router-dom"
import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  HStack,
  IconButton,
  Spacer,
  Text,
  theme,
  VStack,
} from "@chakra-ui/react"
import { initialNovel, Novel } from "../../types/novel.type"
import { api } from "../../utils/api"
import { toast } from "react-toastify"
import { AiFillRead, MdNavigateBefore } from "react-icons/all"
import { size } from "lodash"
import { Episode, PartialEpisode } from "../../types/episode.type"

const NovelDetail: React.FC = () => {
  const novelId = useParams<{ id: string }>().id || ""
  const [novel, setNovel] = React.useState<Novel>(initialNovel)

  const navigate = useNavigate()

  const fetchNovel = async () => {
    const { data } = await api.get<Novel>(`/novels/${novelId}`)
    if (!data) {
      navigate("/novels")
      toast("소설을 찾을 수 없습니다")
    }

    setNovel(data)
  }

  useEffect(() => {
    fetchNovel().then()
  }, [])

  return (
    <>
      <Header />
      <Center
        pl={10}
        pr={10}
        pb={10}
        pt={10}
        mb={7}
        h="300px"
        bgColor={theme.colors.gray[700]}
      >
        <HStack h="100%" w="3xl">
          <VStack align={"baseline"} flexDir="column-reverse" h="100%">
            <Text>{novel.description}</Text>
            <Heading>{novel.title}</Heading>
            <Text color={"gray.500"}>
              {novel.author?.username} 작가 · {novel.episodeIds.length} 편
            </Text>
          </VStack>
          <Spacer />
          <VStack h="100%" align="end">
            <IconButton
              aria-label={"뒤로가기"}
              variant="outline"
              onClick={() => navigate("/novels")}
              icon={<MdNavigateBefore style={{ fontSize: 30 }} />}
            />
            <Spacer />
            <Button colorScheme="purple">
              <AiFillRead style={{ marginRight: 10 }} />
              1편부터 보기
            </Button>
          </VStack>
        </HStack>
      </Center>
      {/*{JSON.stringify(novel)}*/}

      <Container maxW="3xl" display="flex" gap={3} flexDir="column">
        <Text as="b" fontSize="2xl">
          에피소드 목록
        </Text>
        <VStack
          align="baseline"
          bgColor="gray.700"
          borderRadius={10}
          pl={5}
          pr={5}
          pt={3}
          pb={3}
        >
          {novel.episodes.map((episode) => (
            <EpisodeRow key={episode.id} episode={episode} />
          ))}
        </VStack>
      </Container>
    </>
  )
}

const EpisodeRow: React.FC<{ episode: PartialEpisode }> = ({ episode }) => {
  const navigate = useNavigate()

  const onClick = () => {
    navigate(`/episodes/${episode.id}`)
  }

  return (
    <HStack
      onClick={onClick}
      pt={1}
      pb={1}
      cursor="pointer"
      w="100%"
      _hover={{
        background: "gray.400",
      }}
    >
      <Text color="gray.500" fontSize="md" mr={3}>
        {episode.order}편
      </Text>
      <Text fontSize="xl">{episode.title}</Text>
    </HStack>
  )
}

export default NovelDetail
