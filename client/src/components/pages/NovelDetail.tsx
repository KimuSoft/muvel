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
  Skeleton,
  Spacer,
  Text,
  theme,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react"
import { initialNovel, Novel, ShareType } from "../../types/novel.type"
import { api } from "../../utils/api"
import { toast } from "react-toastify"
import styled from "styled-components"
import { MdNavigateBefore } from "react-icons/md"
import { AiFillLock, AiFillRead, AiOutlineLink } from "react-icons/ai"
import EpisodeList from "../organisms/EpisodeList"
import CreateOrUpdateNovel from "../organisms/CreateOrUpdateNovel"

const NovelDetail: React.FC = () => {
  const novelId = useParams<{ id: string }>().id || ""
  const [novel, setNovel] = React.useState<Novel>(initialNovel)
  const [isLoading, setIsLoading] = React.useState(false)

  const navigate = useNavigate()

  const fetchNovel = async () => {
    setIsLoading(true)

    let novel: Novel | null = null
    try {
      novel = (await api.get<Novel>(`/novels/${novelId}`)).data
    } catch (e) {
      navigate("/novels")
      toast.error("이 소설은 주인님만 볼 수 있어요!")
    }

    if (!novel) {
      navigate("/novels")
      toast.error("소설을 찾을 수 없습니다")
      return
    }

    setNovel(novel)
    setIsLoading(false)
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
        _light={{
          background: "gray.200",
        }}
      >
        <HStack h="100%" w="3xl">
          <VStack align={"baseline"} flexDir="column-reverse" h="100%">
            {!isLoading ? (
              <>
                <Text>{novel.description}</Text>
                <Heading>{novel.title}</Heading>
                <HStack>
                  {novel.share !== ShareType.Public ? (
                    novel.share === ShareType.Private ? (
                      <AiFillLock color={theme.colors.gray["500"]} />
                    ) : (
                      <AiOutlineLink color={theme.colors.gray["500"]} />
                    )
                  ) : null}
                  <Text color={"gray.500"}>
                    {novel.author?.username} 작가 · {novel.episodeIds.length}편
                  </Text>
                </HStack>
              </>
            ) : (
              <NovelSkeleton />
            )}
          </VStack>
          <Spacer />
          <VStack h="100%" align="end" gap={3}>
            <IconButton
              aria-label={"뒤로가기"}
              variant="outline"
              onClick={() => navigate("/novels")}
              icon={<MdNavigateBefore style={{ fontSize: 30 }} />}
            />
            <Spacer />
            <CreateOrUpdateNovel novel={novel} onCreateOrUpdate={fetchNovel} />
            <Button colorScheme="purple">
              <AiFillRead style={{ marginRight: 10 }} />
              1편부터 보기
            </Button>
          </VStack>
        </HStack>
      </Center>

      <Container maxW="3xl" display="flex" gap={5} flexDir="column" mb={30}>
        <Heading fontSize="xl">에피소드 목록</Heading>
        <Box
          bgColor={useColorModeValue("gray.100", "gray.700")}
          pl={5}
          pr={5}
          pt={3}
          pb={3}
          borderRadius={10}
        >
          <EpisodeList novel={novel} refresh={fetchNovel} />
        </Box>
      </Container>
    </>
  )
}

const NovelSkeleton: React.FC = () => {
  return (
    <>
      <Skeleton>ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ</Skeleton>
      <Skeleton w="200px" h="50px">
        소설 제목
      </Skeleton>
      <Skeleton>ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ</Skeleton>
    </>
  )
}

const NovelThumbnail = styled.div`
  width: 100%;
  height: 250px;
  border-radius: 5px;
  background-color: #71717a;
`

export default NovelDetail
