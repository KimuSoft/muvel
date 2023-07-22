import React from "react"
import { Heading, HStack, Text } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"

const Logo: React.FC = () => {
  const navigate = useNavigate()

  return (
    <HStack cursor="pointer" onClick={() => navigate("/novels")}>
      <Heading size="lg" userSelect="none">
        Muvel
      </Heading>
      <Text userSelect="none">v0.3.0</Text>
    </HStack>
  )
}

export default Logo
