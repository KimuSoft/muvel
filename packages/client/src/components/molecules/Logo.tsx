import React from "react"
import { Heading, HStack, Text, useColorModeValue } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { RiQuillPenFill } from "react-icons/ri"

const Logo: React.FC = () => {
  const navigate = useNavigate()

  return (
    <HStack cursor="pointer" onClick={() => navigate("/novels")} gap={3}>
      <RiQuillPenFill size={31} />
      <Heading size="lg" userSelect="none">
        Muvel
      </Heading>
      <Text
        color={useColorModeValue("purple.500", "purple.300")}
        fontWeight={"bold"}
        userSelect="none"
      >
        v1.0.2
      </Text>
    </HStack>
  )
}

export default Logo
