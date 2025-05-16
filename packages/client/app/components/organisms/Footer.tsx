import React from "react"
import { HStack, Link, Text } from "@chakra-ui/react"
import BlockLink from "~/components/atoms/BlockLink"

const Footer: React.FC<{ hideInfo?: boolean }> = ({ hideInfo = false }) => {
  return (
    <HStack
      mt={8}
      gap={3}
      rowGap={2}
      fontSize={"sm"}
      color={"gray.400"}
      flexDir={{ base: "column", md: "row" }}
      justifyContent={"center"}
    >
      <Text>
        © 2025{" "}
        <Link href={"https://kimustory.net"} colorPalette={"purple"}>
          Kimustory
        </Link>
        . All rights reserved
      </Text>
      {/*<Text>·</Text>*/}
      {/*<Link color={"gray.500"} href={"https://discord.gg/kQ27qbCJ6V"}>*/}
      {/*  Official Discord*/}
      {/*</Link>*/}
      <Text display={{ base: "none", md: "inline" }}>·</Text>
      <BlockLink to={"/privacy-policy"}>
        <Link as={"div"} color={"gray.400"} fontWeight={500}>
          개인정보처리방침
        </Link>
      </BlockLink>
      <Text display={{ base: "none", md: "inline" }}>·</Text>
      <BlockLink to={"/terms-of-use"}>
        <Link as={"div"} color={"gray.400"}>
          이용약관
        </Link>
      </BlockLink>
      {!hideInfo && (
        <>
          <Text display={{ base: "none", md: "inline" }}>·</Text>
          <BlockLink to={"/info"}>
            <Link as={"div"} color={"gray.400"}>
              소개
            </Link>
          </BlockLink>
        </>
      )}
    </HStack>
  )
}

export default Footer
