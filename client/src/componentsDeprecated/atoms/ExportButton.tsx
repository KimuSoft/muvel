import React from "react"
import { BiCopy } from "react-icons/all"
import { Block } from "../../deprecated/types"
import blocksToString from "../../utils/blocksToString"
import {IBlock} from "../../types";

const ExportButton: React.FC<{ blocks: IBlock[] }> = ({ blocks }) => {
  const onClick = (e: any) => {
    e.clipboardData.setData("text/plain", blocksToString(blocks))
  }

  return <BiCopy onClick={onClick} />
}

export default ExportButton
