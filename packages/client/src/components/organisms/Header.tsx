import React from "react"
import { HStack, Spacer } from "@chakra-ui/react"
import ToggleColorModeButton from "../atoms/ToggleColorModeButton"
import Auth from "../molecules/Auth"
import Logo from "../molecules/Logo"

const Header: React.FC<{ logo?: boolean }> = ({ logo = true }) => {
  return (
    <HStack pl={10} pr={10} h="70px" position={"absolute"} w={"100vw"}>
      {logo ? <Logo /> : null}
      <Spacer />
      <ToggleColorModeButton />
      <Auth />
    </HStack>
  )
}

export default Header
