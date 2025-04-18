import { SortableHandle } from "react-sortable-hoc"
import { type Block } from "~/types/block.type"
import { Menu } from "@chakra-ui/react"
import DragHandle from "./DragHandle"
import ActionMenuList from "./ActionMenuList"
import React from "react"

const Handle = SortableHandle<{ block: Block }>(
  ({ block, onClick }: { block: Block; onClick(): void }) => (
    <Menu.Root lazyMount>
      <Menu.Trigger asChild>
        <DragHandle block={block} onClick={onClick} />
      </Menu.Trigger>
      <ActionMenuList block={block} />
    </Menu.Root>
  ),
)

export default Handle
