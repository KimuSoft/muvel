import { SortableHandle } from "react-sortable-hoc"
import { Block } from "../../../../../types/block.type"
import { Menu, MenuButton } from "@chakra-ui/react"
import DragHandle from "./DragHandle"
import ActionMenuList from "./ActionMenuList"
import React from "react"

const Handle = SortableHandle<{ block: Block }>(
  ({ block, onClick }: { block: Block; onClick(): void }) => (
    <Menu>
      {({ isOpen }) => (
        <>
          <MenuButton as={DragHandle} block={block} onClick={onClick} />
          {isOpen && <ActionMenuList block={block} />}
        </>
      )}
    </Menu>
  )
)

export default Handle
