import React, { useEffect, useMemo, useRef } from "react"
import ContentEditable, { ContentEditableEvent } from "react-contenteditable"
import { BlockContainer, Divider, DividerContainer } from "./styles"
import stringToBlock from "../../../../utils/stringToBlock"
import { SortableElement } from "react-sortable-hoc"
import { Block, BlockType } from "../../../../types/block.type"
import { Box, theme, useColorMode } from "@chakra-ui/react"
import BlockHandle from "../../../atoms/editor/BlockHandle"
import { useRecoilState } from "recoil"
import { blocksState, editorOptionsState } from "../../../../recoil/editor"
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
