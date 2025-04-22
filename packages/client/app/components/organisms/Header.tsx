import React from "react"
import { Center, type CenterProps, HStack, Spacer } from "@chakra-ui/react"

import Auth from "../molecules/Auth"
import Logo from "../molecules/Logo"
import { ColorModeButton } from "~/components/ui/color-mode"
import BlockLink from "~/components/atoms/BlockLink"

const Header: React.FC<{ logo?: boolean; nonWide?: boolean } & CenterProps> = ({
  nonWide,
  logo = true,
  ...props
}) => {
  return (
    <Center
      h="70px"
      position={"absolute"}
      w={"100vw"}
      zIndex={1}
      px={5}
      {...props}
    >
      <HStack w={"100%"} maxW={!nonWide ? undefined : "4xl"} gap={3} h={"70px"}>
        {logo ? (
          <BlockLink to={"/"}>
            <Logo w={128} cursor={"pointer"} />
          </BlockLink>
        ) : null}
        <Spacer />
        <ColorModeButton />
        <Auth />
      </HStack>
    </Center>
  )
}

export default Header
