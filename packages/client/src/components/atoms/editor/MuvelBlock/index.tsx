import { SortableElement } from "react-sortable-hoc"
import { BlockContainer, Divider, DividerContainer } from "./styles"
import { Box, Hide } from "@chakra-ui/react"
import { BlockType } from "../../../../types/block.type"
import React from "react"
import ContentEditableBlock, {
  BlockContentEditableProps,
} from "./ContentEditableBlock"
import Handle from "./Handle"
import DividerBlock from "./DividerBlock"

const MuvelBlock = SortableElement<BlockContentEditableProps>(
  (props: BlockContentEditableProps) => (
    <BlockContainer>
      <Hide below={"md"}>
        <Box position="relative" right="40px">
          <Handle block={props.block} />
        </Box>
      </Hide>

      {props.block.blockType === BlockType.Divider ? (
        <DividerBlock />
      ) : (
        <ContentEditableBlock {...props} />
      )}
    </BlockContainer>
  )
)

export default MuvelBlock
