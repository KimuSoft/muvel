import React, { useEffect } from "react"
import styled from "styled-components"
import { Block, BlockType } from "./types"
import ContentBlockV2, {
  AddBlockEvent,
  ContentBlockMoveEvent,
  DeleteBlockEvent,
} from "./ContentBlockV2"

const EditorBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  gap: 30px;

  width: 800px;
  @media (max-width: 1000px) {
    width: 100%;
  }

  height: 100%;
`

const DummyBlock = styled.div<{ height: string }>`
  width: 100%;
  height: ${(props) => props.height};
`

const EditorHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;
  gap: 15px;

  width: 100%;
  height: 40px;
`

const ContentsBlock = styled.div`
  //display: flex;
  //flex-direction: column;
  //align-items: center;
  padding: 0 10px 0 0;
  cursor: text;

  //overflow-y: scroll;

  width: 800px;
  @media (max-width: 1000px) {
    width: 100%;
  }
  height: 100%;

  ::-webkit-scrollbar {
    width: 5px;
    background-color: transparent;
    cursor: pointer;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #3f3f46;
    border-radius: 10px;
    width: 5px;

    // hover color animation
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: #111113;
    }
  }
`

const Editor: React.FC<{
  defaultBlocks: Block[]
  onChange(blocks: Block[]): Promise<void>
}> = ({ defaultBlocks, onChange }) => {
  const [appliedBlockData, setAppliedBlockData] =
    React.useState<Block[]>(defaultBlocks)
  const [blockData, setBlockData] = React.useState<Block[]>(defaultBlocks)

  useEffect(() => {
    onChange(blockData).then()
  }, [blockData])

  const onAddBlock = async (e: AddBlockEvent) => {
    console.log("onEnter", e.currentId)

    const _blockData = blockData.map((block) => ({ ...block, isNew: false }))
    _blockData.splice(
      _blockData.findIndex((b) => b.id === e.currentId) + 1,
      0,
      {
        id: Math.random().toString(),
        blockType: BlockType.Description,
        content: e.defaultContent || "",
        isNew: true,
      }
    )

    setBlockData(_blockData)

    console.log(_blockData, "blockData")

    setAppliedBlockData(_blockData)
    console.log(appliedBlockData)
  }

  const _onChange = async (block: Block) => {
    console.log(
      "onChange",
      block,
      blockData.map((b) => (b.id === block.id ? block : b))
    )
    setBlockData(blockData.map((b) => (b.id === block.id ? block : b)))
  }

  const onDelete = async (e: DeleteBlockEvent) => {
    console.log("onDelete", e.currentId)

    let _blockData: Block[] = blockData.map((block) => ({
      ...block,
      isNew: false,
    }))

    _blockData[_blockData.findIndex((b) => b.id === e.currentId) - 1].isNew =
      true
    console.log(_blockData, "mi")
    _blockData = _blockData.filter((b) => b.id !== e.currentId)

    console.log(_blockData)
    setBlockData(_blockData)
    setAppliedBlockData(_blockData)
  }

  const onMovePrev = async (e: ContentBlockMoveEvent) => {
    console.log("onMovePrev", e.currentId)

    const _blockData = blockData.map((block) => ({ ...block, isNew: false }))
    const index = _blockData.findIndex((b) => b.id === e.currentId)
    _blockData[index - 1].isNew = true
    setBlockData(_blockData)
    setAppliedBlockData(_blockData)
  }

  const onMoveNext = async (e: ContentBlockMoveEvent) => {
    console.log("onMovePrev", e.currentId)

    const _blockData = blockData.map((block) => ({ ...block, isNew: false }))
    const index = _blockData.findIndex((b) => b.id === e.currentId)
    _blockData[index + 1].isNew = true
    setBlockData(_blockData)
    setAppliedBlockData(_blockData)
  }

  const onMoveFocus = async (e: ContentBlockMoveEvent) => {
    console.log("onMoveFocus", e.currentId, e.caretPos)

    const _blockData = blockData.map((block) => ({ ...block, isNew: false }))
    const index = _blockData.findIndex((b) => b.id === e.currentId)
    _blockData[index + e.direction].isNew = true
    _blockData[index + e.direction].focusPos = e.caretPos

    setBlockData(_blockData)
    setAppliedBlockData(_blockData)
  }

  return (
    <EditorBlock>
      <ContentsBlock>
        <DummyBlock height={"100px"} />
        {appliedBlockData.map((b, idx) => (
          <ContentBlockV2
            block={b}
            key={b.id}
            autoFocus={b.isNew}
            focusPos={b.focusPos}
            onChange={_onChange}
            onAddBlock={onAddBlock}
            onDeleteBlock={onDelete}
            onMoveFocus={onMoveFocus}
            // 아래 블록타입이 위 블록타입과 다르면 패딩 추가
            bottomPadding={appliedBlockData[idx + 1].blockType !== b.blockType}
          />
        ))}
        <DummyBlock height={"500px"} />
      </ContentsBlock>
    </EditorBlock>
  )
}

export default Editor
