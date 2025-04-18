import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { BlockType } from "~/types/block.type"
import { BlockContainer } from "./Styles"
import { Box } from "@chakra-ui/react"
import ContentEditableBlock, {
  type BlockContentEditableProps,
} from "./ContentEditableBlock"
import Handle from "./Handle"
import DividerBlock from "./DividerBlock"

const MuvelBlock: React.FC<BlockContentEditableProps & { id: string }> = ({
  id,
  block,
  ...props
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <BlockContainer ref={setNodeRef} style={style} {...attributes}>
      {/* 드래그 핸들 */}
      <Box
        position="relative"
        right="40px"
        display={{ base: "none", md: "block" }}
      >
        <Handle block={block} listeners={listeners} attributes={attributes} />
      </Box>

      {block.blockType === BlockType.Divider ? (
        <DividerBlock />
      ) : (
        <ContentEditableBlock block={block} {...props} />
      )}
    </BlockContainer>
  )
}

export default MuvelBlock
