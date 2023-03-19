import React, { useContext, useEffect, useState } from "react"
import Block, { SortableBlock } from "../../atoms/block"
import usePrevious from "../../../hooks/usePrevious"
import setCaretToEnd from "../../../utils/setCaretToEnd"
import { DummyBlock, EditorContainer } from "./styles"
import EditorContext from "../../../context/EditorContext"
import { BlockType, PartialBlock } from "../../../types/block.type"
import _ from "lodash"
import { v4 } from "uuid"
import {
  arrayMove,
  SortableContainer,
  SortableContainerProps,
} from "react-sortable-hoc"

const canvas = document.createElement("canvas").getContext("2d")!

const _SortableContainer = SortableContainer<React.PropsWithChildren>(
  ({ children }: React.PropsWithChildren) => {
    return <ul>{children}</ul>
  }
)

const Editor: React.FC = () => {
  const { episode, setEpisode } = useContext(EditorContext)
  const [currentBlockId, setCurrentBlockId] = useState<string>("1")

  const prevBlocks = usePrevious<PartialBlock[]>(episode.blocks)

  // Handling the cursor and focus on adding and deleting blocks
  useEffect(() => {
    // If a new block was added, move the caret to it
    if (prevBlocks && prevBlocks.length + 1 === episode.blocks.length) {
      const nextBlockPosition =
        episode.blocks.map((b) => b.id).indexOf(currentBlockId) + 1 + 1
      const nextBlock = document.querySelector(
        `[data-position="${nextBlockPosition}"]`
      ) as HTMLElement
      if (nextBlock) {
        nextBlock.focus()
      }
    }
    // If a block was deleted, move the caret to the end of the last block
    if (prevBlocks && prevBlocks.length - 1 === episode.blocks.length) {
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
  }, [episode.blocks, prevBlocks, currentBlockId])

  const addBlockHandler = (block: PartialBlock) => {
    setCurrentBlockId(block.id)
    setEpisode((e) => {
      const _blocks = e.blocks.map((b) => ({ ...b, focus: false }))
      _blocks.splice(_blocks.findIndex((b) => b.id === block.id) + 1, 0, {
        id: v4(),
        blockType: BlockType.Describe,
        content: "",
        focus: true,
      })
      return {
        ...e,
        blocks: _blocks,
      }
    })
  }

  const deleteBlockHandler = ({ id }: { id: string }) => {
    setCurrentBlockId(id)
    const index = episode.blocks.findIndex((b) => b.id === id)

    // 첫 블록은 지울 수 없음
    if (!index) return

    setEpisode((e) => ({
      ...e,
      blocks: e.blocks.filter((b) => b.id !== id),
    }))
  }

  const updateBlockHandler = (block: PartialBlock) => {
    setEpisode((e) => {
      return {
        ...e,
        blocks: e.blocks.map((b) => (b.id === block.id ? block : b)),
      }
    })
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

  const onSortEnd: SortableContainerProps["onSortEnd"] = ({
    oldIndex,
    newIndex,
  }) => {
    setEpisode((episode) => ({
      ...episode,
      blocks: arrayMove(episode.blocks, oldIndex, newIndex),
    }))
  }

  return (
    <EditorContainer>
      <DummyBlock height={"100px"} />
      <_SortableContainer onSortEnd={onSortEnd} pressDelay={100} lockAxis="y">
        {episode.blocks.map((b, index) => {
          const bp =
            index !== episode.blocks.length - 1 &&
            episode.blocks[index + 1]?.blockType !== b.blockType

          return (
            <SortableBlock
              key={b.id}
              index={index}
              block={b}
              position={index + 1}
              addBlock={addBlockHandler}
              deleteBlock={deleteBlockHandler}
              updateBlock={updateBlockHandler}
              moveToRelativeBlock={moveToRelativeBlockHandler}
              bottomSpacing={bp}
            />
          )
        })}
      </_SortableContainer>
      <DummyBlock height={"500px"} />
    </EditorContainer>
  )
}

export default Editor
