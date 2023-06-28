import React from "react"
import { Novel } from "../../types/novel.type"
import { Box, HStack, Spacer, Text, theme } from "@chakra-ui/react"
import styled from "styled-components"
import { useNavigate } from "react-router-dom"

const NovelCard: React.FC<{ novel: Novel }> = ({ novel }) => {
  const navigate = useNavigate()

  const onClick = () => {
    navigate(`/novels/${novel.id}`)
  }

  return (
    <Box
      display="flex"
      w={187}
      gap={2}
      flexDir="column"
      cursor="pointer"
      onClick={onClick}
    >
      <NovelThumbnail
        style={{
          backgroundImage: novel.thumbnail || "",
        }}
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
            <Text fontSize="sm" color={theme.colors.gray["400"]}>
              {novel.episodeIds.length}편
            </Text>
          </HStack>
          <Text fontSize="sm" color={theme.colors.gray["400"]}>
            {novel.author?.username}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

const NovelThumbnail = styled.div`
  width: 100%;
  height: 250px;
  border-radius: 5px;
  background-color: #71717a;
`

export default NovelCard
