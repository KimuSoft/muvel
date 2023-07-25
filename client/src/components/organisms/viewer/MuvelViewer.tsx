import React, { useMemo } from "react"
import { BlockType } from "../../../types/block.type"
import styled from "styled-components"
import {
  Box,
  Button,
  Container,
  HStack,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react"
import { useRecoilState } from "recoil"
import { blocksState, episodeState, novelState } from "../../../recoil/editor"
import MuvelBlock from "../../molecules/viewer/MuvelBlock"
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai"
import { useNavigate } from "react-router-dom"

const MuvelViewer: React.FC<{ initialFocusedBlockId?: string }> = ({
  initialFocusedBlockId,
}) => {
  const [novel] = useRecoilState(novelState)
  const [episode] = useRecoilState(episodeState)
  const [blocks] = useRecoilState(blocksState)

  const navigate = useNavigate()

  const getBlockNodes = () => {
    const hasFocus = (blockType: BlockType) =>
      ![BlockType.Divider].includes(blockType)

    let skipIndex = 0
    return blocks.map((b, index) => {
      const bp =
        index !== blocks.length - 1 &&
        blocks[index + 1]?.blockType !== b.blockType

      if (!hasFocus(b.blockType)) skipIndex++

      return (
        <React.Fragment key={b.id}>
          <MuvelBlock key={`${b.id}-block`} block={b} />
          <PaddingBlock height={bp ? 20 : 0} key={`${b.id}-bottom`} />
        </React.Fragment>
      )
    })
  }

  const noBlockTextColor = useColorModeValue("gray.200", "gray.600")

  const nextEpisodeId = useMemo(() => {
    const currentEpisodeIndex = novel.episodes.findIndex(
      (e) => e.id === episode.id
    )

    if (currentEpisodeIndex === -1) return null
    if (currentEpisodeIndex === novel.episodes.length - 1) return null

    return novel.episodes[currentEpisodeIndex + 1].id
  }, [novel, episode.id])

  const beforeEpisodeId = useMemo(() => {
    const currentEpisodeIndex = novel.episodes.findIndex(
      (e) => e.id === episode.id
    )

    if (currentEpisodeIndex === -1) return null
    if (currentEpisodeIndex === 0) return null

    return novel.episodes[currentEpisodeIndex - 1].id
  }, [novel, episode.id])

  return (
    <Container maxW="3xl">
      <VStack w="100%" gap={0}>
        <Box w="100%" h="100px" />
        {getBlockNodes()}
        {blocks.length ? null : (
          <Text color={noBlockTextColor}>내용이 없어요...</Text>
        )}

        <HStack>
          <Button
            variant={"outline"}
            gap={3}
            mt={30}
            isDisabled={!beforeEpisodeId}
            onClick={() => navigate(`/episodes/${beforeEpisodeId}/viewer`)}
          >
            <AiOutlineArrowLeft />
            이전 편 보기
          </Button>
          <Button
            variant={"outline"}
            gap={3}
            mt={30}
            isDisabled={!nextEpisodeId}
            onClick={() => navigate(`/episodes/${nextEpisodeId}/viewer`)}
          >
            다음 편 보기
            <AiOutlineArrowRight />
          </Button>
        </HStack>
        <Box w="100%" h="500px" />
      </VStack>
    </Container>
  )
}

const PaddingBlock = styled.div<{ height: number }>`
  height: ${({ height }) => height}px;
  transition: height 0.5s ease;
`

export default MuvelViewer
