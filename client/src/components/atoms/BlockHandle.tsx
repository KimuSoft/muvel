import React from "react"
import { BsDiamondFill } from "react-icons/all"
import { BlockType } from "../../types/block.type"
import styled from "styled-components"

const BlockHandle: React.FC<{ blockType: BlockType }> = ({ blockType }) => {
  return (
    <>
      <HandleIcon />
    </>
  )
}

const HandleContainer = styled.div`
  width: 32px;
`

const HandleIcon = styled(BsDiamondFill)`
  width: 12px;
  height: 12px;

  &:hover {
    opacity: 0.8;
  }

  transition: opacity 0.2s ease-in-out;
`

export default BlockHandle
