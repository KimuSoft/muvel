import React, { useEffect, useState } from "react"
import usePrevious from "../../../hooks/usePrevious"
import setCaretToEnd from "../../../utils/setCaretToEnd"
import { Block, BlockType } from "../../../types/block.type"
import _ from "lodash"
import { v4 } from "uuid"
import { SortableContainer, SortableContainerProps } from "react-sortable-hoc"
import styled from "styled-components"
import {
  Box,
  Container,
  Text,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react"
import { arrayMoveImmutable } from "array-move"
import { useRecoilState } from "recoil"
import { blocksState, episodeState } from "../../../recoil/editor"
import EditableMuvelBlock from "../../molecules/editor/MuvelBlock/EditableMuvelBlock"

const canvas = document.createElement("canvas").getContext("2d")!

const _SortableContainer = SortableContainer<React.PropsWithChildren>(
  ({ children }: React.PropsWithChildren) => {
    return <ul>{children}</ul>
  }
)

const MuvelBlockEditor: React.FC<{ initialFocusedBlockId?: string }> = ({
  initialFocusedBlockId,
}) => {
  const [episode, setEpisode] = useRecoilState(episodeState)
  const [blocks, setBlocks] = useRecoilState(blocksState)

  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(
    initialFocusedBlockId ?? null
  )
  const [episodeDescription, setEpisodeDescription] = useState<string>(
    episode.description
  )

  const prevBlocks = usePrevious<Block[]>(blocks)

  const getFocusIndex = (id: string) => {
    const b = blocks.find((b) => b.id === id)

    if (!b) {
      console.warn("Block not found")
      return -1
    }
    return blocks
      .filter((b) => ![BlockType.Divider].includes(b.blockType))
      .indexOf(b)
  }

  // ID를 통해 특정 블록에 포커스를 준다.
  useEffect(() => {
    if (!focusedBlockId) return

    const focusBlockIndex = getFocusIndex(focusedBlockId)
    const focusBlock = document.querySelector(
      `.data_position_${focusBlockIndex}`
    ) as HTMLDivElement | null

    if (!focusBlock) return console.log("Cannot find block: " + focusedBlockId)
    setFocusedBlockId(null)

    if (!prevBlocks) {
      focusBlock.focus()
    } else if (prevBlocks.length > blocks.length) {
      setCaretToEnd(focusBlock)
    } else {
      focusBlock.focus()
    }
  }, [focusedBlockId])

  useEffect(() => {
    setEpisode((e) => ({ ...e, description: episodeDescription }))
  }, [episodeDescription])

  const addBlockHandler = (blockId?: string, content?: string) => {
    const id = v4()
    setFocusedBlockId(id)

    setBlocks((b) => {
      const _blocks = b.map((bl) => ({ ...bl, focus: false }))

      const index = _blocks.findIndex((b) => b.id === blockId) + 1 || 0

      _blocks.splice(index, 0, {
        id,
        blockType: BlockType.Describe,
        content: content || "",
        focus: true,
      })

      return _blocks
    })
  }

  const deleteBlockHandler = ({ id }: { id: string }) => {
    const index = blocks.findIndex((b) => b.id === id)
    const prevBlockId = blocks[index - 1]?.id

    if (!prevBlockId) return console.warn("prevBlockIndex is null")
    setFocusedBlockId(prevBlockId)

    setBlocks((b) => b.filter((b) => b.id !== id))
  }

  const updateBlockHandler = (block: Block) => {
    // console.log(block)
    setBlocks((_blocks) => _blocks.map((b) => (b.id === block.id ? block : b)))
  }

  const moveToRelativeBlockHandler = (
    currentPos: number,
    direction: -1 | 1,
    preserveCaretPosition: boolean
  ) => {
    const lastBlock = document.querySelector(
      `.data_position_${currentPos + direction}`
    ) as HTMLElement | null

    if (!lastBlock)
      return console.log(`data_position ${currentPos + direction} is null`)

    const sel = document.getSelection()

    if (sel && lastBlock?.firstChild && preserveCaretPosition) {
      const target = lastBlock.firstChild as Text

      const targetText = target.nodeValue

      const currentText = sel.anchorNode?.nodeValue

      if (!currentText || !targetText) return lastBlock.focus()

      const currentTextWidth = _.sum(
        currentText
          .slice(0, sel.anchorOffset)
          .split("")
          .map((char) => canvas.measureText(char).width)
      )
      const targetTextWidth = targetText
        .split("")
        .map((char) => canvas.measureText(char).width)

      let sum = 0

      let nearOffset = 0
      let nearIndex = 0

      let lastOffset = 0

      for (let i = 0; i < targetTextWidth.length; i++) {
        const item = targetTextWidth[i]

        sum += item

        const offset = Math.abs(sum - currentTextWidth)

        if (i === 0 || offset <= nearOffset) {
          nearOffset = offset
          nearIndex = i
        }

        if (lastOffset < offset && i) break

        lastOffset = offset
      }

      sel.setPosition(target, nearIndex + 1)
      lastBlock.focus()

      return
    }

    if (lastBlock) {
      if (direction === -1) setCaretToEnd(lastBlock)
      if (direction === 1) lastBlock.focus()
    }
  }

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
          <EditableMuvelBlock
            key={`${b.id}-block`}
            index={index}
            block={b}
            position={hasFocus(b.blockType) ? index - skipIndex : -99}
            addBlock={addBlockHandler}
            deleteBlock={deleteBlockHandler}
            updateBlock={updateBlockHandler}
            moveToRelativeBlock={moveToRelativeBlockHandler}
          />
          <PaddingBlock height={bp ? 20 : 0} key={`${b.id}-bottom`} />
        </React.Fragment>
      )
    })
  }

  const onSortEnd: SortableContainerProps["onSortEnd"] = ({
    oldIndex,
    newIndex,
  }) => setBlocks(arrayMoveImmutable(blocks, oldIndex, newIndex))

  const onEpisodeDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEpisodeDescription(e.target.value)
  }

  const addLastBlock = () => {
    if (!blocks.length) return addBlockHandler()

    const lastBlock = blocks[blocks.length - 1]!
    if (!lastBlock.content) return setFocusedBlockId(lastBlock.id)

    addBlockHandler(lastBlock?.id)
  }

  const noBlockTextColor = useColorModeValue("gray.200", "gray.600")

  return (
    <Container maxW="3xl">
      <Text color="gray.500" mb={3}>
        에피소드 설명
      </Text>
      <Textarea
        defaultValue={episode.description}
        bgColor={useColorModeValue("gray.200", "gray.900")}
        border="none"
        _focus={{ border: "none" }}
        mb={10}
        onChange={onEpisodeDescriptionChange}
      />
      <Text color="gray.500" mb={3}>
        본문
      </Text>
      <_SortableContainer onSortEnd={onSortEnd} pressDelay={100} lockAxis="y">
        {getBlockNodes()}
      </_SortableContainer>
      <Box w="100%" h="500px" onClick={addLastBlock}>
        {blocks.length ? null : (
          <Text color={noBlockTextColor}>
            빈 공간을 클릭해서 새 블록을 생성해 보세요
          </Text>
        )}
      </Box>
    </Container>
  )
}

const PaddingBlock = styled.div<{ height: number }>`
  height: ${({ height }) => height}px;
  transition: height 0.5s ease;
`

export default MuvelBlockEditor
