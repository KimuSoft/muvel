import React, { useEffect } from "react"
import { MdLogin } from "react-icons/md"
import { useNavigate } from "react-router-dom"
import useCurrentUser from "../../hooks/useCurrentUser"
import styled from "styled-components"
import { Button, Center, Heading, HStack, Text, VStack } from "@chakra-ui/react"
import { AiFillRead } from "react-icons/ai"

const Main: React.FC = () => {
  const user = useCurrentUser()
  const navigate = useNavigate()

  useEffect(() => {
    // 메인 페이지에 접속했을 때 로그인이 되어 있다면 가장 최근의 소설 작업 페이지로 리다이렉트
    if (user) {
      navigate("/episodes/" + user.recentEpisodeId)
    }
  }, [])

  const loginClickHandler = () => {
    window.location.href = import.meta.env.VITE_API_BASE + "/auth/login"
  }

  return (
    <Center w="100vw" h="100vh">
      <MainBackground />
      <VStack justify={"center"} spacing={7}>
        <VStack spacing={3}>
          <Heading as="h1" size="4xl">
            Muvel
          </Heading>
          <Text size="4xl">당신과 당신의 이야기를 위한 작은 방</Text>
        </VStack>
        <HStack>
          <Button onClick={loginClickHandler} colorScheme={"purple"}>
            <MdLogin style={{ marginRight: 8 }} />
            로그인하고 글쓰기
          </Button>
          <Button
            onClick={() => {
              navigate("/novels")
            }}
            colorScheme={"purple"}
          >
            <AiFillRead style={{ marginRight: 8 }} />
            소설 보러 가기
          </Button>
        </HStack>
      </VStack>
    </Center>
  )
}

const MainBackground = styled.div`
  position: fixed;

  height: 100vh;
  width: 100vw;

  background-image: url("https://cdn.pixabay.com/photo/2017/08/08/00/33/constellations-2609647_960_720.jpg");
  filter: blur(8px);
  -webkit-filter: blur(8px);
  background-size: cover;

  // 뒤에 그려야 함
  z-index: -1;
`

export default Main
