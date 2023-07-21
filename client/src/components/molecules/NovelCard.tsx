import React from "react"
import { Novel } from "../../types/novel.type"
import {
  Box,
  HStack,
  Spacer,
  Text,
  theme,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"

const NovelCard: React.FC<{ novel: Novel }> = ({ novel }) => {
  const navigate = useNavigate()

  const onClick = () => {
    navigate(`/novels/${novel.id}`)
  }

  return (
    <Tooltip label={novel.description} openDelay={500}>
      <Box
        display="flex"
        w={187}
        gap={2}
        flexDir="column"
        cursor="pointer"
        onClick={onClick}
      >
        <Box
          w="100%"
          h="250px"
          borderRadius="5px"
          backgroundColor={useColorModeValue("gray.200", "gray.700")}
          backgroundImage={novel.thumbnail || ""}
          backgroundRepeat={"no-repeat"}
          backgroundSize={"cover"}
          backgroundPosition={"center"}
        />
        <Box
          w="100%"
          display="flex"
          alignItems="baseline"
          paddingLeft="5px"
          paddingRight="5px"
        >
          <Box w="100%">
            <HStack>
              <Text as="b" fontSize="md">
                {novel.title}
              </Text>
              <Spacer />
              <Text
                fontSize="sm"
                color={theme.colors.gray["400"]}
                flexShrink={0}
              >
                {novel.episodeIds.length}편
              </Text>
            </HStack>
            <Text fontSize="sm" color={theme.colors.gray["400"]}>
              {novel.author?.username}
            </Text>
          </Box>
        </Box>
      </Box>
    </Tooltip>
  )
}

export default NovelCard
