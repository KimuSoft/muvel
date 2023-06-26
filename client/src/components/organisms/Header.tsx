import React from "react"
import { Heading, HStack, Spacer } from "@chakra-ui/react"
import ToggleColorModeButton from "../atoms/ToggleColorModeButton"

const Header: React.FC = () => {
  return (
    <HStack pl={10} pr={10} pt={7} pb={7}>
      <Heading>Muvel</Heading>
      <Spacer />
      <ToggleColorModeButton />
    </HStack>
  )
}

export default Header
