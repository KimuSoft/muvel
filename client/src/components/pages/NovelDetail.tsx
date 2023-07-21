import React, { createRef, useEffect } from "react"
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
  Tooltip,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { initialNovel, Novel, ShareType } from "../../types/novel.type"
import { api } from "../../utils/api"
import { toast } from "react-toastify"
import styled from "styled-components"
import { MdNavigateBefore } from "react-icons/md"
import { AiFillLock, AiFillRead, AiOutlineLink } from "react-icons/ai"
import EpisodeList from "../organisms/EpisodeList"
import CreateNovel from "../organisms/CreateNovel"
import { blocksState, episodeState } from "../../recoil/editor"
import stringToBlocks from "../../utils/stringToBlock"
import axios from "axios"
import imageCompression from "browser-image-compression"

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
        <HStack h="100%" w="3xl" align={"end"} gap={8}>
          {/*<NovelThumbnail novel={novel} />*/}
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
            <CreateNovel novel={novel} refresh={fetchNovel} />
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

const readFile = (file: File) =>
  new Promise<string | ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target!.result!)
    reader.onerror = reject
    reader.readAsText(file)
  })

const NovelThumbnail: React.FC<{ novel: Novel }> = ({ novel }) => {
  const toast = useToast()
  const fileInput = createRef<HTMLInputElement>()

  const clickHandler = () => fileInput.current?.click()

  const uploadHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return alert("파일을 선택해주세요")
    // const r = await readFile(e.target.files[0])

    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1200,
    }

    const compressedFile = await imageCompression(e.target.files[0], options)
    console.log(compressedFile.size / 1024 / 1024 + " MB")

    const formData = new FormData()
    formData.append("image", compressedFile, "kimukimu.png")

    await api.post(`/novels/${novel.id}/thumbnail`, formData)
    toast({
      title: "섬네일 업로드 성공",
      description: "섬네일이 성공적으로 업로드되었어요!",
      status: "success",
    })
  }

  return (
    <>
      <input
        type="file"
        style={{ display: "none" }}
        ref={fileInput}
        accept="image/*"
        onChange={uploadHandler}
      />
      <Tooltip label="섬네일 업로드하기">
        <_NovelThumbnail
          style={{ backgroundImage: novel.thumbnail }}
          onClick={clickHandler}
        />
      </Tooltip>
    </>
  )
}

const _NovelThumbnail = styled.div`
  width: 70px;
  height: 100px;
  border-radius: 5px;
  background-color: var(--chakra-colors-gray-200);

  cursor: pointer;
`

export default NovelDetail
