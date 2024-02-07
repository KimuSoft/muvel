import React from "react"
import {
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Tooltip,
} from "@chakra-ui/react"
import { MdDescription } from "react-icons/md"
import { Block, BlockType } from "../../../../../types/block.type"
import {
  BiSolidCommentDots,
  BiSolidQuoteLeft,
  BiSolidQuoteSingleLeft,
} from "react-icons/bi"
import { BsCode } from "react-icons/bs"
import { AiTwotoneDelete } from "react-icons/ai"
import { useRecoilState } from "recoil"
import { blocksState } from "../../../../../recoil/editor"

const ActionMenuList: React.FC<{ block: Block }> = ({ block }) => {
  const [_blocks, setBlocks] = useRecoilState(blocksState)

  const removePunctuation = (str: string) =>
    str.replace(/[“”‘’「」『』〈〉《》]/g, "").trim()

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

  const onChangeToCommentBlock = () => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id
          ? {
              ...b,
              blockType: BlockType.Comment,
            }
          : b
      )
    )
  }

  const onChangeToSingleScytheBlock = () => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id
          ? {
              ...b,
              content: `「${removePunctuation(b.content)}」`,
              blockType: BlockType.SingleScythe,
            }
          : b
      )
    )
  }

  const onChangeToDoubleScytheBlock = () => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id
          ? {
              ...b,
              content: `『${removePunctuation(b.content)}』`,
              blockType: BlockType.DoubleScythe,
            }
          : b
      )
    )
  }

  const onChangeToSingleGuillemetBlock = () => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id
          ? {
              ...b,
              content: `〈${removePunctuation(b.content)}〉`,
              blockType: BlockType.SingleGuillemet,
            }
          : b
      )
    )
  }

  const onChangeToDoubleGuillemetBlock = () => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id
          ? {
              ...b,
              content: `《${removePunctuation(b.content)}》`,
              blockType: BlockType.DoubleGuillemet,
            }
          : b
      )
    )
  }

  const onDelete = () => {
    setBlocks((prev) => prev.filter((b) => b.id !== block.id))
  }

  return (
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
        <Tooltip
          label="독자는 볼 수 없는 블록으로 소설 출력 시에도 이 부분은 나타나지 않습니다. 작가를 위한 복선, 설정, 표시 정리 등에 쓰입니다."
          openDelay={500}
        >
          <MenuItem
            icon={<BiSolidCommentDots />}
            onClick={onChangeToCommentBlock}
            {...getSelectedProps(BlockType.Comment)}
          >
            주석 블록
          </MenuItem>
        </Tooltip>
        <Tooltip
          label="홑낫표(「 」)로 감싸진 블록입니다. 용어 설명 시에 보통 사용됩니다."
          openDelay={500}
        >
          <MenuItem
            icon={<BsCode />}
            onClick={onChangeToSingleScytheBlock}
            {...getSelectedProps(BlockType.SingleScythe)}
          >
            용어 블록 A
          </MenuItem>
        </Tooltip>
        <Tooltip
          label="겹낫표(『 』)로 감싸진 블록입니다. 강조 대사, 판타지 주문 등에 사용됩니다."
          openDelay={500}
        >
          <MenuItem
            icon={<BsCode />}
            onClick={onChangeToDoubleScytheBlock}
            {...getSelectedProps(BlockType.DoubleScythe)}
          >
            강조 블록 A
          </MenuItem>
        </Tooltip>
        <Tooltip label="홑화살괄호(〈 〉)로 감싸진 블록입니다." openDelay={500}>
          <MenuItem
            icon={<BsCode />}
            onClick={onChangeToSingleGuillemetBlock}
            {...getSelectedProps(BlockType.SingleGuillemet)}
          >
            용어 블록 B
          </MenuItem>
        </Tooltip>
        <Tooltip label="겹화살괄호(《 》)로 감싸진 블록입니다." openDelay={500}>
          <MenuItem
            icon={<BsCode />}
            onClick={onChangeToDoubleGuillemetBlock}
            {...getSelectedProps(BlockType.DoubleGuillemet)}
          >
            강조 블록 B
          </MenuItem>
        </Tooltip>
      </MenuGroup>
      <MenuDivider />
      <MenuGroup title="블록 액션">
        <MenuItem icon={<AiTwotoneDelete />} color="red.500" onClick={onDelete}>
          삭제하기
        </MenuItem>
      </MenuGroup>
    </MenuList>
  )
}

export default ActionMenuList
