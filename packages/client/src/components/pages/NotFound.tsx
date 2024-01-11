import { Button, Center, Heading, VStack } from "@chakra-ui/react"
import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AiOutlineArrowRight } from "react-icons/ai"

const NotFoundPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    console.log("기을")
  })

  return (
    <Center w="100vw" h="100vh">
      <VStack gap={7}>
        <Heading fontSize={"2xl"} color={"gray.500"}>
          아무래도 이야기의 늪에서 길을 잃은 모양입니다...
        </Heading>
        <Button
          onClick={() => navigate("/")}
          colorScheme={"purple"}
          variant={"outline"}
          gap={3}
        >
          <AiOutlineArrowRight />
          집으로 돌아가기
        </Button>
      </VStack>
    </Center>
  )
}

export default NotFoundPage
