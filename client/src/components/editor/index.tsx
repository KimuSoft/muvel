import React, { useEffect, useState } from "react"
import { BlockType, IBlock } from "../../types"
import Block from "../block"
import usePrevious from "../../hooks/usePrevious"
import setCaretToEnd from "../../utils/setCaretToEnd"
import { ContentsBlock, DummyBlock, EditorBlock } from "./styles"

const defaultBlocks: IBlock[] = [
  {
    id: "1",
    blockType: BlockType.Describe,
    content: "hello",
  },
]

const Editor: React.FC<{ onChange?(block: IBlock[]): void }> = ({onChange}) => {
  const [blocks, setBlocks] = useState<IBlock[]>(defaultBlocks)
  const [currentBlockId, setCurrentBlockId] = useState<string>("1")

  const prevBlocks = usePrevious<IBlock[]>(blocks)

  // Handling the cursor and focus on adding and deleting blocks
  useEffect(() => {
    onChange?.(blocks)

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
      console.log(currentBlockId)
      console.log(lastBlock)
      if (lastBlock) {
        setCaretToEnd(lastBlock)
      }
    }
  }, [blocks, prevBlocks, currentBlockId])

  const addBlockHandler = (block: IBlock) => {
    setCurrentBlockId(block.id)
    setBlocks((b) => {
      const _blocks = b.map((b) => ({ ...b, focus: false }))
      _blocks.splice(_blocks.findIndex((b) => b.id === block.id) + 1, 0, {
        id: Math.random().toString(),
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

    if (!index) return console.log("첫 번째 블록은 지울 수 없어요!")

    console.log("backspace")
    setBlocks((b) => b.filter((b) => b.id !== id))
  }

  const updateBlockHandler = (block: IBlock) => {
    setBlocks((b) => {
      return b.map((b) => (b.id === block.id ? block : b))
    })
  }

  return (
    <EditorBlock>
      <ContentsBlock>
        <b>{window.getSelection()?.focusOffset || 0}</b>
        <br />
        <b>{JSON.stringify(blocks)}</b>
        <DummyBlock height={"100px"} />
        {blocks.map((b, index) => (
          <Block
            block={b}
            position={index + 1}
            addBlock={addBlockHandler}
            deleteBlock={deleteBlockHandler}
            updateBlock={updateBlockHandler}
            key={b.id}
          />
        ))}
        <DummyBlock height={"500px"} />
      </ContentsBlock>
    </EditorBlock>
  )
}

export default Editor
