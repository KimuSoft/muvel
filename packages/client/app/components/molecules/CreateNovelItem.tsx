import React, { forwardRef } from "react"
import { Center, Heading, HStack, Icon, Text, VStack } from "@chakra-ui/react"
import { TbPlus } from "react-icons/tb"

const CreateNovelItem = forwardRef<HTMLDivElement>(({ ...props }, ref) => {
  return (
    <HStack
      rounded={5}
      h="152px"
      cursor={"pointer"}
      userSelect={"none"}
      ref={ref}
      borderWidth={1}
      borderColor={"transparent"}
      overflow={"none"}
      transition={"border-color 0.2s"}
      _hover={{ borderColor: { base: "gray.100", _dark: "purple.500" } }}
      {...props}
    >
      <Center
        w="100px"
        h="150px"
        borderRadius={"md"}
        backgroundColor={{ base: "gray.200", _dark: "gray.900" }}
        backgroundSize={"cover"}
        backgroundPosition={"center"}
        flexShrink={0}
      >
        <Icon color={"gray.800"}>
          <TbPlus size={64} />
        </Icon>
      </Center>
      <VStack h={"100%"} gap={1} px={3} py={2}>
        <HStack w={"100%"}>
          <Heading color={"purple.500"} fontSize={"sm"}>
            새 소설 쓰기
          </Heading>
        </HStack>
        <Text color={"gray.500"} fontSize={"sm"}>
          얼마든지 새 아이디어를 펼쳐 보세요!
        </Text>
      </VStack>
    </HStack>
  )
})

export default CreateNovelItem
