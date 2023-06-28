import React, { useContext, useEffect, useState } from "react"
import { SortableBlock } from "../../atoms/block"
import usePrevious from "../../../hooks/usePrevious"
import setCaretToEnd from "../../../utils/setCaretToEnd"
import { DummyBlock, EditorContainer } from "./styles"
import EditorContext from "../../../context/EditorContext"
import { Block, BlockType } from "../../../types/block.type"
import _ from "lodash"
import { v4 } from "uuid"
import { SortableContainer, SortableContainerProps } from "react-sortable-hoc"
import styled from "styled-components"
import { Box, Container } from "@chakra-ui/react"
import { arrayMoveImmutable } from "array-move"

const canvas = document.createElement("canvas").getContext("2d")!

const _SortableContainer = SortableContainer<React.PropsWithChildren>(
  ({ children }: React.PropsWithChildren) => {
    return <ul>{children}</ul>
  }
)

const Editor: React.FC = () => {
  const { blocks, setBlocks } = useContext(EditorContext)
  const [currentBlockId, setCurrentBlockId] = useState<string>("1")

  const prevBlocks = usePrevious<Block[]>(blocks)

  // Handling the cursor and focus on adding and deleting blocks
  useEffect(() => {
    // If a new block was added, move the caret to it
    if (prevBlocks && prevBlocks.length + 1 === blocks.length) {
      const nextBlockPosition =
        blocks.map((b) => b.id).indexOf(currentBlockId) + 1 + 1
      const nextBlock = document.querySelector(
        `[data-position="${nextBlockPosition}"]`
      ) as HTMLElement
      if (nextBlock) {
        nextBlock.focus()
      }
    }
    // If a block was deleted, move the caret to the end of the last block
    if (prevBlocks && prevBlocks.length - 1 === blocks.length) {
      const lastBlockPosition = prevBlocks
        .map((b) => b.id)
        .indexOf(currentBlockId)
      const lastBlock = document.querySelector(
        `[data-position="${lastBlockPosition}"]`
      ) as HTMLElement
      if (lastBlock) {
        setCaretToEnd(lastBlock)
      }
    }
  }, [blocks, prevBlocks, currentBlockId])

  const addBlockHandler = (block: Block) => {
    setCurrentBlockId(block.id)

    setBlocks((b) => {
      const _blocks = b.map((bl) => ({ ...bl, focus: false }))

      _blocks.splice(_blocks.findIndex((b) => b.id === block.id) + 1, 0, {
        id: v4(),
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
    const lastBlock = document.querySelector(
      `[data-position="${currentPos + direction}"]`
    ) as HTMLElement

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

  const hasFocus = (blockType: BlockType) =>
    ![BlockType.Divider].includes(blockType)

  const getBlockNodes = () => {
    let skipIndex = 0
    return blocks.map((b, index) => {
      const bp =
        index !== blocks.length - 1 &&
        blocks[index + 1]?.blockType !== b.blockType

      if (!hasFocus(b.blockType)) skipIndex++

      return (
        <>
          <SortableBlock
            key={b.id}
            index={index}
            block={b}
            position={hasFocus(b.blockType) ? index + 1 - skipIndex : -99}
            addBlock={addBlockHandler}
            deleteBlock={deleteBlockHandler}
            updateBlock={updateBlockHandler}
            moveToRelativeBlock={moveToRelativeBlockHandler}
          />
          <PaddingBlock height={bp ? 20 : 0} key={b.id + "-bottom"} />
        </>
      )
    })
  }

  const onSortEnd: SortableContainerProps["onSortEnd"] = ({
    oldIndex,
    newIndex,
  }) => setBlocks(arrayMoveImmutable(blocks, oldIndex, newIndex))

  return (
    <Container maxW="3xl">
      <Box h={100} />
      <_SortableContainer onSortEnd={onSortEnd} pressDelay={100} lockAxis="y">
        {getBlockNodes()}
      </_SortableContainer>
      <DummyBlock height={"500px"} />
    </Container>
  )
}

const PaddingBlock = styled.div<{ height: number }>`
  height: ${({ height }) => height}px;
  transition: height 0.5s ease;
`

export default Editor
