import React from "react"
import { Heading, HStack, Spacer, Text } from "@chakra-ui/react"
import ToggleColorModeButton from "../atoms/ToggleColorModeButton"
import Auth from "../molecules/Auth"

const Header: React.FC = () => {
  return (
    <HStack pl={10} pr={10} h="70px">
      <Heading size="lg">Muvel</Heading> <Text>v0.1.0</Text>
      <Spacer />
      <Auth />
      <ToggleColorModeButton />
    </HStack>
  )
}

export default Header
