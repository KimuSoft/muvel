import React from "react"
import { HStack, Spacer, useMediaQuery } from "@chakra-ui/react"
import ToggleColorModeButton from "../atoms/ToggleColorModeButton"
import Auth from "../molecules/Auth"
import Logo from "../molecules/Logo"

const Header: React.FC<{ logo?: boolean }> = ({ logo = true }) => {
  const [isPC] = useMediaQuery("(min-width: 800px)")

  return (
    <HStack px={isPC ? 10 : 5} h="70px" position={"absolute"} w={"100vw"}>
      {logo ? <Logo /> : null}
      <Spacer />
      <ToggleColorModeButton />
      <Auth />
    </HStack>
  )
}

export default Header
