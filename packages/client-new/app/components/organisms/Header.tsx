import React from "react"
import { HStack, Spacer, useMediaQuery } from "@chakra-ui/react"
import Auth from "../molecules/Auth"
import Logo from "../molecules/Logo"
import { ColorModeButton } from "~/components/ui/color-mode"

const Header: React.FC<{ logo?: boolean }> = ({ logo = true }) => {
  return (
    <HStack px={5} h="70px" position={"absolute"} w={"100vw"}>
      {logo ? <Logo /> : null}
      <Spacer />
      <ColorModeButton />
      <Auth />
    </HStack>
  )
}

export default Header
