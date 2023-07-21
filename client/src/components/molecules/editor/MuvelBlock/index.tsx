import React from "react"
import { BlockContainer, Divider, DividerContainer } from "./styles"
import { SortableElement } from "react-sortable-hoc"
import { BlockType } from "../../../../types/block.type"
import { Box } from "@chakra-ui/react"
import BlockHandle from "../../../atoms/editor/BlockHandle"
import "./block.css"
import BlockContentEditable, {
  BlockContentEditableProps,
} from "../../../atoms/editor/BlockContentEditable"

const MuvelBlock = SortableElement<BlockContentEditableProps>(
  (props: BlockContentEditableProps) => (
    <BlockContainer>
      <Box position="relative" right="40px">
        <BlockHandle block={props.block} />
      </Box>

      {props.block.blockType === BlockType.Divider ? (
        <DividerContainer>
          <Divider />
        </DividerContainer>
      ) : (
        <BlockContentEditable {...props} />
      )}
    </BlockContainer>
  )
)

export default MuvelBlock
