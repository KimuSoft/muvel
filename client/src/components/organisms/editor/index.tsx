import React, { useContext, useEffect, useState } from "react"
import Block from "../../atoms/block"
import usePrevious from "../../../hooks/usePrevious"
import setCaretToEnd from "../../../utils/setCaretToEnd"
import { ContentsBlock, DummyBlock, EditorBlock } from "./styles"
import EditorContext from "../../../context/EditorContext"
import { BlockType, PartialBlock } from "../../../types/block.type"

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
      console.log(currentBlockId)
      console.log(lastBlock)
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
        id: Math.random().toString(),
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

    setEpisode({
      ...episode,
      blocks: episode.blocks.filter((b) => b.id !== id),
    })
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
    direction: -1 | 1
  ) => {
    const lastBlock = document.querySelector(
      `[data-position="${currentPos + direction}"]`
    ) as HTMLElement

    if (lastBlock) {
      if (direction === -1) setCaretToEnd(lastBlock)
      if (direction === 1) lastBlock.focus()
    }
  }

  return (
    <EditorBlock>
      <ContentsBlock>
        {/*<b>{window.getSelection()?.focusOffset || 0}</b>*/}
        {/*<br />*/}
        {/*<b>{JSON.stringify(blocks)}</b>*/}
        <DummyBlock height={"100px"} />
        {episode.blocks.map((b, index) => {
          const bp = episode.blocks[index + 1]?.blockType !== b.blockType

          return (
            <Block
              block={b}
              position={index + 1}
              addBlock={addBlockHandler}
              deleteBlock={deleteBlockHandler}
              updateBlock={updateBlockHandler}
              moveToRelativeBlock={moveToRelativeBlockHandler}
              key={b.id}
              bottomSpacing={bp}
            />
          )
        })}
        <DummyBlock height={"500px"} />
      </ContentsBlock>
    </EditorBlock>
  )
}

export default Editor
