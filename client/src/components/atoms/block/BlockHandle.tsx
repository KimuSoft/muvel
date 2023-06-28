import React, { useContext } from "react"
import { Block, BlockType } from "../../../types/block.type"
import styled from "styled-components"
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
} from "@chakra-ui/react"
import { BiSolidQuoteLeft, BiSolidQuoteSingleLeft } from "react-icons/bi"
import { BsDiamondFill } from "react-icons/bs"
import { MdDescription } from "react-icons/md"
import EditorContext from "../../../context/EditorContext"
import { FiDelete } from "react-icons/fi"
import { AiTwotoneDelete } from "react-icons/ai"

const BlockHandle: React.FC<{ block: Block; onClick(): void }> = ({
  block,
  onClick,
}) => {
  const { setBlocks } = useContext(EditorContext)

  const removePunctuation = (str: string) => str.replace(/[“”‘’]/g, "").trim()

  const getSelectedProps = (blockType: BlockType) =>
    blockType === block.blockType
      ? {
          color: "purple.200",
          disabled: true,
          cursor: "default",
        }
      : {}

  const onChangeToDescribeBlock = () => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id
          ? {
              ...b,
              content: removePunctuation(b.content),
              blockType: BlockType.Describe,
            }
          : b
      )
    )
  }

  const onChangeToDoubleQuoteBlock = () => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id
          ? {
              ...b,
              content: `“${removePunctuation(b.content)}”`,
              blockType: BlockType.DoubleQuote,
            }
          : b
      )
    )
  }

  const onChangeToSingleQuoteBlock = () => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id
          ? {
              ...b,
              content: `‘${removePunctuation(b.content)}’`,
              blockType: BlockType.SingleQuote,
            }
          : b
      )
    )
  }

  const onDelete = () => {
    setBlocks((prev) => prev.filter((b) => b.id !== block.id))
  }

  return (
    <Menu>
      <MenuButton as={HandleContainer} onClick={onClick} />
      <HandleContainer onClick={onClick}>
        {block.blockType !== BlockType.DoubleQuote ? (
          <MenuButton as={HandleIcon} className="block-handle" />
        ) : (
          <MenuButton as={HandleIcon} className="block-handle" />
          // <ProfileHandle /> 일단 비활성화
        )}
      </HandleContainer>
      <MenuList>
        <MenuGroup title="블록 종류">
          <MenuItem
            icon={<MdDescription />}
            onClick={onChangeToDescribeBlock}
            {...getSelectedProps(BlockType.Describe)}
          >
            묘사 블록
          </MenuItem>
          <MenuItem
            icon={<BiSolidQuoteLeft />}
            onClick={onChangeToDoubleQuoteBlock}
            {...getSelectedProps(BlockType.DoubleQuote)}
          >
            대사 블록
          </MenuItem>
          <MenuItem
            icon={<BiSolidQuoteSingleLeft />}
            onClick={onChangeToSingleQuoteBlock}
            {...getSelectedProps(BlockType.SingleQuote)}
          >
            독백 블록
          </MenuItem>
        </MenuGroup>
        <MenuDivider />
        <MenuGroup title="블록 액션">
          <MenuItem
            icon={<AiTwotoneDelete />}
            color="red.500"
            onClick={onDelete}
          >
            삭제하기
          </MenuItem>
        </MenuGroup>
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
