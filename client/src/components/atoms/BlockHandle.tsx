import React from "react"
import { BsDiamondFill } from "react-icons/all"
import { BlockType } from "../../types/block.type"
import styled from "styled-components"

const BlockHandle: React.FC<{ blockType: BlockType }> = ({ blockType }) => {
  return (
    <HandleContainer className="block-handle">
      <HandleIcon />
    </HandleContainer>
  )
}

const HandleContainer = styled.div`
  width: 32px;
  height: 50px;

  display: flex;
  align-items: center;
  justify-content: center;

  opacity: 0;
  transition: opacity 0.2s ease-in-out;

  cursor: pointer;
`

const HandleIcon = styled(BsDiamondFill)`
  width: 16px;
  height: 16px;

  &:hover {
    // zinc/300
    color: #d4d4d8;
  }

  transition: color 0.2s ease-in-out;
  // zinc/500
  color: #71717a;
`

export default BlockHandle
