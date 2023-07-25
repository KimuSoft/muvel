import React from "react"
import { BlockContainer, Divider, DividerContainer } from "./styles"
import { SortableElement } from "react-sortable-hoc"
import { BlockType } from "../../../../types/block.type"
import { Box, Hide } from "@chakra-ui/react"
import BlockHandle from "../../../atoms/editor/BlockHandle"
import "./block.css"
import BlockContentEditable, {
  BlockContentEditableProps,
} from "../../../atoms/editor/BlockContentEditable"

const EditableMuvelBlock = SortableElement<BlockContentEditableProps>(
  (props: BlockContentEditableProps) => (
    <BlockContainer>
      <Hide below={"md"}>
        <Box position="relative" right="40px">
          <BlockHandle block={props.block} />
        </Box>
      </Hide>

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

export default EditableMuvelBlock
