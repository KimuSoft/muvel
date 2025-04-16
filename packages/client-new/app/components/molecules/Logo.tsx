import React from "react"
import { Heading, HStack, Text } from "@chakra-ui/react"
import { RiQuillPenFill } from "react-icons/ri"
import { useNavigate } from "react-router"

const Logo: React.FC = () => {
  const navigate = useNavigate()

  return (
    <HStack cursor="pointer" onClick={() => navigate("/")} gap={2}>
      <RiQuillPenFill size={31} />
      <Heading size="2xl" userSelect="none">
        Muvel
      </Heading>
      <Text
        color={{ base: "purple.500", _dark: "purple.300" }}
        fontWeight={"bold"}
        userSelect="none"
      >
        v2
      </Text>
    </HStack>
  )
}

export default Logo
