import React from "react"
import { BiCopy, BiDownArrow } from "react-icons/all"
import { Block } from "../../types"
import blocksToString from "../../utils/blocksToString"

const ExportButton: React.FC<{ blocks: Block[] }> = ({ blocks }) => {
  const onClick = (e: any) => {
    e.clipboardData.setData("text/plain", blocksToString(blocks))
  }

  return <BiCopy onClick={onClick} />
}

export default ExportButton
