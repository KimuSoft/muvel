import React, { useMemo } from "react"
import { Center, type CenterProps, HStack, Spacer, Tag } from "@chakra-ui/react"

import Auth from "../molecules/Auth"
import Logo from "../molecules/Logo"
import { ColorModeButton } from "~/components/ui/color-mode"
import BlockLink from "~/components/atoms/BlockLink"
import { usePlatform } from "~/hooks/usePlatform"
import { FaDesktop, FaMobile } from "react-icons/fa6"
import { CiGlobe } from "react-icons/ci"

const Header: React.FC<{ logo?: boolean; nonWide?: boolean } & CenterProps> = ({
  nonWide,
  logo = true,
  ...props
}) => {
  const { isMobile, isTauri } = usePlatform()

  const envIcon = useMemo(() => {
    if (!isTauri) return <CiGlobe />
    if (isMobile) return <FaMobile />
    return <FaDesktop />
  }, [isTauri, isMobile])

  return (
    <Center
      h="70px"
      position={"absolute"}
      w={"100%"}
      zIndex={1}
      px={{
        base: 3,
        sm: 5,
        md: 8,
      }}
      {...props}
    >
      <HStack w={"100%"} maxW={!nonWide ? undefined : "4xl"} gap={3} h={"70px"}>
        {logo ? (
          <>
            <BlockLink to={"/"}>
              <Logo w={128} cursor={"pointer"} />
            </BlockLink>
            <Tag.Root>
              {envIcon}
              <Tag.Label ml={1}>v{import.meta.env.VITE_APP_VERSION}</Tag.Label>
            </Tag.Root>
          </>
        ) : null}
        <Spacer />
        <ColorModeButton />
        <Auth />
      </HStack>
    </Center>
  )
}

export default Header
