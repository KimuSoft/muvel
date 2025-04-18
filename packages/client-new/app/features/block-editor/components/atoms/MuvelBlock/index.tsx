import { SortableElement } from "react-sortable-hoc"
import { BlockContainer } from "./styles"
import { Box } from "@chakra-ui/react"
import { BlockType } from "~/types/block.type"
import React from "react"
import ContentEditableBlock, {
  type BlockContentEditableProps,
} from "./ContentEditableBlock"
import Handle from "./Handle"
import DividerBlock from "./DividerBlock"

const MuvelBlock = SortableElement<BlockContentEditableProps>(
  (props: BlockContentEditableProps) => (
    <BlockContainer>
      <Box
        position="relative"
        right="40px"
        display={{ base: "none", md: "block" }}
      >
        <Handle block={props.block} />
      </Box>

      {props.block.blockType === BlockType.Divider ? (
        <DividerBlock />
      ) : (
        <ContentEditableBlock {...props} />
      )}
    </BlockContainer>
  ),
)

export default MuvelBlock
