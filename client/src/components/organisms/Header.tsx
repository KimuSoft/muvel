import React from "react"
import { Heading, HStack, Spacer, Text } from "@chakra-ui/react"
import ToggleColorModeButton from "../atoms/ToggleColorModeButton"
import Auth from "../molecules/Auth"
import Logo from "../molecules/Logo"

const Header: React.FC = () => {
  return (
    <HStack pl={10} pr={10} h="70px">
      <Logo />
      <Spacer />
      <Auth />
      <ToggleColorModeButton />
    </HStack>
  )
}

export default Header
