import React, { type MouseEventHandler } from "react"
import { type Block } from "~/types/block.type"
import { Menu } from "@chakra-ui/react"
import DragHandle from "./DragHandle"
import ActionMenuList from "./ActionMenuList"

interface HandleProps {
  block: Block
  onClick?: () => void
  listeners?: React.HTMLAttributes<HTMLElement>
  attributes?: Record<string, any>
}

const Handle: React.FC<HandleProps> = ({
  block,
  onClick,
  listeners,
  attributes,
}) => {
  return (
    <Menu.Root lazyMount>
      <Menu.Trigger asChild>
        <DragHandle
          block={block}
          onClick={onClick}
          {...listeners}
          {...attributes}
        />
      </Menu.Trigger>
      <ActionMenuList block={block} />
    </Menu.Root>
  )
}

export default Handle
