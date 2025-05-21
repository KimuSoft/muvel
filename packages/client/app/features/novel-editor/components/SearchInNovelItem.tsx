import React, { type ReactNode } from "react"
import { Highlight, HStack, Icon, Spacer, Text, VStack } from "@chakra-ui/react"
import { Tooltip } from "~/components/ui/tooltip"
import BlockLink from "~/components/atoms/BlockLink"

interface SearchInNovelItemProps {
  title: string
  description?: string | null
  subDescription?: string | null
  link: string
  highlight: string
  icon: ReactNode
}

const SearchInNovelItem: React.FC<SearchInNovelItemProps> = ({
  title,
  description,
  subDescription,
  link,
  highlight,
  icon,
}) => {
  return (
    <BlockLink
      style={{
        width: "100%",
      }}
      to={link}
    >
      <HStack
        w="100%"
        px={4}
        py={3}
        borderRadius={5}
        cursor="pointer"
        bgColor={{ base: "gray.100", _dark: "gray.800" }}
        _hover={{
          backgroundColor: { base: "gray.200", _dark: "gray.600" },
        }}
        transition="background-color 0.1s ease"
        gap={3}
      >
        <Icon size={"lg"} flexShrink={0} color="gray.500">
          {icon}
        </Icon>
        <VStack align="baseline" gap={1} w={"100%"} overflow="hidden">
          <Tooltip content={title} openDelay={1000}>
            <Text w={"100%"} truncate>
              <Highlight
                query={highlight}
                styles={{
                  // color: { base: "purple.600", _dark: "purple.300" },
                  backgroundColor: { base: "purple.300", _dark: "purple.500" },
                  fontWeight: 800,
                }}
              >
                {title}
              </Highlight>
            </Text>
          </Tooltip>
          <HStack w="100%" fontSize={"xs"} color={"gray.500"}>
            {description ?? <Text>{description}</Text>}
            <Spacer />
            {subDescription ?? <Text>{subDescription}</Text>}
          </HStack>
        </VStack>
      </HStack>
    </BlockLink>
  )
}

export default SearchInNovelItem
