"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Box, Text } from "@chakra-ui/react"
import _ from "lodash"
import { v4 } from "uuid"
import { type Block, BlockType } from "~/types/block.type"
import MuvelBlock from "../atoms/MuvelBlock"
import { useBlockEditor } from "~/features/block-editor/context/EditorContext"
import usePrevious from "~/features/block-editor/hooks/usePrevious"
import setCaretToEnd from "~/features/block-editor/utils/setCaretToEnd"

const MuvelBlockEditor: React.FC<{ initialFocusedBlockId?: string }> = ({
  initialFocusedBlockId,
}) => {
  const { blocks, updateBlocks } = useBlockEditor()
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(
    initialFocusedBlockId ?? null,
  )

  const canvas = useMemo(() => {
    if (typeof window === "undefined") return null
    return document.createElement("canvas").getContext("2d")!
  }, [])

  const prevBlocks = usePrevious<Block[]>(blocks)

  const getFocusIndex = (id: string) => {
    const b = blocks.find((b) => b.id === id)
    if (!b) return -1
    return blocks
      .filter((b) => ![BlockType.Divider].includes(b.blockType))
      .indexOf(b)
  }

  useEffect(() => {
    if (!focusedBlockId) return

    const focusBlockIndex = getFocusIndex(focusedBlockId)
    const focusBlock = document.querySelector(
      `.data_position_${focusBlockIndex}`,
    ) as HTMLDivElement | null

    if (!focusBlock) return
    setFocusedBlockId(null)

    if (!prevBlocks) {
      focusBlock.focus()
    } else if (prevBlocks.length > blocks.length) {
      setCaretToEnd(focusBlock)
    } else {
      focusBlock.focus()
    }
  }, [focusedBlockId])

  const addBlockHandler = (blockId?: string, content?: string) => {
    const id = v4()
    setFocusedBlockId(id)

    updateBlocks((b) => {
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

    if (!prevBlockId) return
    setFocusedBlockId(prevBlockId)

    updateBlocks((b) => b.filter((b) => b.id !== id))
  }

  const updateBlockHandler = (block: Block) => {
    updateBlocks((_blocks) =>
      _blocks.map((b) => (b.id === block.id ? block : b)),
    )
  }

  const moveToRelativeBlockHandler = (
    currentPos: number,
    direction: -1 | 1,
    preserveCaretPosition: boolean,
  ) => {
    if (!canvas) return

    const lastBlock = document.querySelector(
      `.data_position_${currentPos + direction}`,
    ) as HTMLElement | null

    if (!lastBlock) return

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
          .map((char) => canvas.measureText(char).width),
      )
      const targetTextWidth = targetText
        .split("")
        .map((char) => canvas.measureText(char).width)

      let sum = 0,
        nearOffset = 0,
        nearIndex = 0,
        lastOffset = 0

      for (let i = 0; i < targetTextWidth.length; i++) {
        const offset = Math.abs((sum += targetTextWidth[i]) - currentTextWidth)
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

    direction === -1 ? setCaretToEnd(lastBlock) : lastBlock.focus()
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
          <MuvelBlock
            key={`${b.id}-block`}
            id={b.id} // 꼭 필요: dnd-kit 기준은 id
            // index={index}
            block={b}
            position={hasFocus(b.blockType) ? index - skipIndex : -99}
            addBlock={addBlockHandler}
            deleteBlock={deleteBlockHandler}
            updateBlock={updateBlockHandler}
            moveToRelativeBlock={moveToRelativeBlockHandler}
          />
          <Box
            h={`${bp ? 20 : 0}px`}
            key={`${b.id}-bottom`}
            transition={"height 0.5s ease"}
          />
        </React.Fragment>
      )
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!active || !over || active.id === over.id) return

    const oldIndex = blocks.findIndex((b) => b.id === active.id)
    const newIndex = blocks.findIndex((b) => b.id === over.id)

    updateBlocks(() => arrayMove(blocks, oldIndex, newIndex))
  }

  const addLastBlock = () => {
    if (!blocks.length) return addBlockHandler()

    const lastBlock = blocks[blocks.length - 1]!
    if (!lastBlock.content) return setFocusedBlockId(lastBlock.id)

    addBlockHandler(lastBlock?.id)
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
  )

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {getBlockNodes()}
        </SortableContext>
      </DndContext>

      <Box w="100%" h="500px" onClick={addLastBlock}>
        {blocks.length ? null : (
          <Text color={{ base: "gray.200", _dark: "gray.600" }}>
            빈 공간을 클릭해서 새 블록을 생성해 보세요
          </Text>
        )}
      </Box>
    </>
  )
}

export default MuvelBlockEditor
