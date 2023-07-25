import React, { useEffect } from "react"
import Header from "../organisms/Header"
import { useNavigate, useParams } from "react-router-dom"
import {
  Box,
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
  useToast,
  VStack,
} from "@chakra-ui/react"
import { initialNovel, Novel, ShareType } from "../../types/novel.type"
import { api } from "../../utils/api"
import styled from "styled-components"
import { MdNavigateBefore } from "react-icons/md"
import { AiFillLock, AiOutlineLink } from "react-icons/ai"
import EpisodeList from "../organisms/EpisodeList"
import CreateOrUpdateNovel from "../organisms/CreateOrUpdateNovel"
import { AxiosError } from "axios"
import useCurrentUser from "../../hooks/useCurrentUser"

const NovelDetail: React.FC = () => {
  const novelId = useParams<{ id: string }>().id || ""
  const user = useCurrentUser()

  const [novel, setNovel] = React.useState<Novel>(initialNovel)
  const [isLoading, setIsLoading] = React.useState(false)

  const navigate = useNavigate()
  const toast = useToast()

  const fetchNovel = async () => {
    setIsLoading(true)

    let novel: Novel | null = null
    try {
      novel = (await api.get<Novel>(`/novels/${novelId}`)).data
    } catch (e) {
      if (!(e instanceof AxiosError)) return
      switch (e.response?.status) {
        case 401:
          toast({
            title: "로그인이 필요해요!",
            description: "로그인을 하고 다시 시도해주세요.",
            status: "info",
          })
          window.location.href = import.meta.env.VITE_API_BASE + "/auth/login"
          return
        case 403:
          toast({
            title: "권한 부족",
            description: "이 소설을 볼 권한이 부족해요!",
            status: "error",
          })
          break
        case 404:
          toast({
            title: "소설 찾기 실패",
            description: "어... 그런 소설이 있나요?",
            status: "error",
          })
          break
        case 500:
          toast({
            title: "서버 오류",
            description: "서버에서 오류가 발생했어요!",
            status: "error",
          })
          break
        default:
          toast({
            title: "알 수 없는 오류가 발생했어요!",
            description: e.message,
            status: "error",
          })
      }

      return navigate("/novels")
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
        p={10}
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
          <EpisodeList
            novel={novel}
            onChange={fetchNovel}
            isLoading={isLoading}
          />
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
