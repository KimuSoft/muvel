import React from "react"
import { AiFillFileAdd, BsDiamondFill } from "react-icons/all"
import { BlockType } from "../../types/block.type"
import styled from "styled-components"
import {
  Box,
  Center,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react"

const BlockHandle: React.FC<{ blockType: BlockType; onClick(): void }> = ({
  blockType,
  onClick,
}) => {
  return (
    <Menu>
      <MenuButton as={HandleContainer} onClick={onClick} />
      <HandleContainer onClick={onClick}>
        {blockType !== BlockType.DoubleQuote ? (
          <MenuButton as={HandleIcon} className="block-handle" />
        ) : (
          <MenuButton as={HandleIcon} className="block-handle" />
          // <ProfileHandle /> 일단 비활성화
        )}
      </HandleContainer>
      <MenuList>
        <MenuItem icon={<AiFillFileAdd />} command="⌘T">
          New Tab
        </MenuItem>
      </MenuList>
    </Menu>
  )
}

const ProfileHandle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;

  background-image: url("https://images-ext-1.discordapp.net/external/atUpFQ_YqgO18SQEzG4aOrGq_2ojJew1l11yOtAcxcY/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/287177141064302592/ca91a80856dcdc96b8fea1001b5dd94f.png");
  background-size: cover;
  background-color: #71717a;
`

const HandleContainer = styled.div`
  position: absolute;

  width: 32px;
  height: 50px;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
`

const HandleIcon = styled(BsDiamondFill)`
  width: 16px;
  height: 16px;

  &:hover {
    // zinc/300
    color: #d4d4d8;
  }

  transition: all 0.2s ease-in-out;
  // zinc/500
  color: #71717a;
  opacity: 0;
`

export default BlockHandle
