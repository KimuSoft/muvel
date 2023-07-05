import React, { useContext, useEffect, useState } from "react"
import { SortableBlock } from "../../atoms/block"
import usePrevious from "../../../hooks/usePrevious"
import setCaretToEnd from "../../../utils/setCaretToEnd"
import { DummyBlock } from "./styles"
import EditorContext from "../../../context/EditorContext"
import { Block, BlockType } from "../../../types/block.type"
import _ from "lodash"
import { v4 } from "uuid"
import { SortableContainer, SortableContainerProps } from "react-sortable-hoc"
import styled from "styled-components"
import {
  Container,
  Skeleton,
  Text,
  Textarea,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react"
import { arrayMoveImmutable } from "array-move"

const canvas = document.createElement("canvas").getContext("2d")!

const _SortableContainer = SortableContainer<React.PropsWithChildren>(
  ({ children }: React.PropsWithChildren) => {
    return <ul>{children}</ul>
  }
)

const Editor: React.FC = () => {
  const { blocks, setBlocks, episode, setEpisode, isLoading } =
    useContext(EditorContext)
  const [currentBlockId, setCurrentBlockId] = useState<string>("1")
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

  const getFocusIndexOnPrevBlock = (id: string) => {
    if (!prevBlocks) return -1
    const b = prevBlocks.find((b) => b.id === id)

    if (!b) {
      console.warn("Block not found")
      return -1
    }
    return prevBlocks
      .filter((b) => ![BlockType.Divider].includes(b.blockType))
      .indexOf(b)
  }

  // Handling the cursor and focus on adding and deleting blocks
  useEffect(() => {
    // If a new block was added, move the caret to it
    if (prevBlocks && prevBlocks.length + 1 === blocks.length) {
      console.log("added!")
      const nextBlockPosition = getFocusIndex(currentBlockId) + 1
      const nextBlock = document.querySelector(
        `[data-position="${nextBlockPosition}"]`
      ) as HTMLElement
      if (!nextBlock) return console.log("nextBlock is null")
      nextBlock.focus()
    }

    // If a block was deleted, move the caret to the end of the last block
    if (prevBlocks && prevBlocks.length - 1 === blocks.length) {
      const lastBlockPosition = getFocusIndexOnPrevBlock(currentBlockId) - 1
      console.log("deleted from: " + lastBlockPosition)
      const lastBlock = document.querySelector(
        `[data-position="${lastBlockPosition}"]`
      ) as HTMLElement

      if (!lastBlock) {
        window.confirm("삭제하시겠습니까?")
        return console.log("lastBlock is null")
      }
      setCaretToEnd(lastBlock)
    }
  }, [blocks, prevBlocks, currentBlockId])

  useEffect(() => {
    setEpisode((e) => ({ ...e, description: episodeDescription }))
  }, [episodeDescription])

  const addBlockHandler = (block: Block) => {
    setCurrentBlockId(block.id)

    const id = v4()

    setBlocks((b) => {
      const _blocks = b.map((bl) => ({ ...bl, focus: false }))

      _blocks.splice(_blocks.findIndex((b) => b.id === block.id) + 1, 0, {
        id,
        blockType: BlockType.Describe,
        content: "",
        focus: true,
      })

      return _blocks
    })
  }

  const deleteBlockHandler = ({ id }: { id: string }) => {
    setCurrentBlockId(id)
    const index = blocks.findIndex((b) => b.id === id)

    // 첫 블록은 지울 수 없음
    if (!index) return
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
    console.log("MOVE!!")
    const lastBlock = document.querySelector(
      `[data-position="${currentPos + direction}"]`
    ) as HTMLElement

    console.log(currentPos, direction, lastBlock)
    if (!lastBlock)
      return console.log(`data-position ${currentPos + direction} is null`)

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
          <SortableBlock
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

  return (
    <Container maxW="3xl">
      {isLoading ? (
        <EditorSkeleton />
      ) : (
        <>
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
          <_SortableContainer
            onSortEnd={onSortEnd}
            pressDelay={100}
            lockAxis="y"
          >
            {getBlockNodes()}
          </_SortableContainer>
        </>
      )}
      <DummyBlock height={"500px"} />
    </Container>
  )
}

const EditorSkeleton = () => {
  return (
    <VStack gap={10} align={"baseline"}>
      <Skeleton height="20px" width="100%" />
      <Skeleton height="20px" width="80%" />
      <Skeleton height="20px" width="60%" />
      <Skeleton height="20px" width="100%" />
      <Skeleton height="20px" width="60%" />
      <Skeleton height="20px" width="100%" />
      <Skeleton height="22px" width="90%" />
      <Skeleton height="20px" width="100%" />
      <Skeleton height="20px" width="80%" />
      <Skeleton height="20px" width="40%" />
      <Skeleton height="20px" width="100%" />
      <Skeleton height="20px" width="60%" />
      <Skeleton height="20px" width="30%" />
      <Skeleton height="20px" width="60%" />
    </VStack>
  )
}

const PaddingBlock = styled.div<{ height: number }>`
  height: ${({ height }) => height}px;
  transition: height 0.5s ease;
`

export default Editor
