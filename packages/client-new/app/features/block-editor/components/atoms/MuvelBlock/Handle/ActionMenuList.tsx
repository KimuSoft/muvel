import React from "react"
import { MdDescription } from "react-icons/md"
import {
  BiSolidCommentDots,
  BiSolidQuoteLeft,
  BiSolidQuoteSingleLeft,
} from "react-icons/bi"
import { BsCode } from "react-icons/bs"
import { AiTwotoneDelete } from "react-icons/ai"
import { type Block, BlockType } from "~/types/block.type"
import { Tooltip } from "~/components/ui/tooltip"
import { Menu, MenuItemGroup } from "@chakra-ui/react"
import { useBlockEditor } from "~/features/block-editor/context/EditorContext"

const ActionMenuList: React.FC<{ block: Block }> = ({ block }) => {
  const { updateBlocks } = useBlockEditor()

  const removePunctuation = (str: string) =>
    str.replace(/[“”‘’「」『』〈〉《》]/g, "").trim()

  const getSelectedProps = (blockType: BlockType) =>
    blockType === block.blockType
      ? {
          color: "purple.200",
          disabled: true,
          cursor: "default",
          value: blockType.toString(),
        }
      : {
          value: blockType.toString(),
        }

  const onChangeToDescribeBlock = () => {
    updateBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id
          ? {
              ...b,
              content: removePunctuation(b.content),
              blockType: BlockType.Describe,
            }
          : b,
      ),
    )
  }

  const onChangeToDoubleQuoteBlock = () => {
    updateBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id
          ? {
              ...b,
              content: `“${removePunctuation(b.content)}”`,
              blockType: BlockType.DoubleQuote,
            }
          : b,
      ),
    )
  }

  const onChangeToSingleQuoteBlock = () => {
    updateBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id
          ? {
              ...b,
              content: `‘${removePunctuation(b.content)}’`,
              blockType: BlockType.SingleQuote,
            }
          : b,
      ),
    )
  }

  const onChangeToCommentBlock = () => {
    updateBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id
          ? {
              ...b,
              blockType: BlockType.Comment,
            }
          : b,
      ),
    )
  }

  const onChangeToSingleScytheBlock = () => {
    updateBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id
          ? {
              ...b,
              content: `「${removePunctuation(b.content)}」`,
              blockType: BlockType.SingleScythe,
            }
          : b,
      ),
    )
  }

  const onChangeToDoubleScytheBlock = () => {
    updateBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id
          ? {
              ...b,
              content: `『${removePunctuation(b.content)}』`,
              blockType: BlockType.DoubleScythe,
            }
          : b,
      ),
    )
  }

  const onChangeToSingleGuillemetBlock = () => {
    updateBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id
          ? {
              ...b,
              content: `〈${removePunctuation(b.content)}〉`,
              blockType: BlockType.SingleGuillemet,
            }
          : b,
      ),
    )
  }

  const onChangeToDoubleGuillemetBlock = () => {
    updateBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id
          ? {
              ...b,
              content: `《${removePunctuation(b.content)}》`,
              blockType: BlockType.DoubleGuillemet,
            }
          : b,
      ),
    )
  }

  const onDelete = () => {
    updateBlocks((prev) => prev.filter((b) => b.id !== block.id))
  }

  return (
    <Menu.Content>
      <Menu.ItemGroup>
        <Menu.ItemGroupLabel>블록 종류</Menu.ItemGroupLabel>
        <Menu.Item
          onClick={onChangeToDescribeBlock}
          {...getSelectedProps(BlockType.Describe)}
        >
          <MdDescription />
          묘사 블록
        </Menu.Item>
        <Menu.Item
          onClick={onChangeToDoubleQuoteBlock}
          {...getSelectedProps(BlockType.DoubleQuote)}
        >
          <BiSolidQuoteLeft />
          대사 블록
        </Menu.Item>
        <Menu.Item
          onClick={onChangeToSingleQuoteBlock}
          {...getSelectedProps(BlockType.SingleQuote)}
        >
          <BiSolidQuoteSingleLeft />
          독백 블록
        </Menu.Item>
        <Tooltip
          content="독자는 볼 수 없는 블록으로 소설 출력 시에도 이 부분은 나타나지 않습니다. 작가를 위한 복선, 설정, 표시 정리 등에 쓰입니다."
          openDelay={500}
        >
          <Menu.Item
            onClick={onChangeToCommentBlock}
            {...getSelectedProps(BlockType.Comment)}
          >
            <BiSolidCommentDots />
            주석 블록
          </Menu.Item>
        </Tooltip>
        <Tooltip
          content="홑낫표(「 」)로 감싸진 블록입니다. 용어 설명 시에 보통 사용됩니다."
          openDelay={500}
        >
          <Menu.Item
            onClick={onChangeToSingleScytheBlock}
            {...getSelectedProps(BlockType.SingleScythe)}
          >
            <BsCode />
            용어 블록 A
          </Menu.Item>
        </Tooltip>
        <Tooltip
          content="겹낫표(『 』)로 감싸진 블록입니다. 강조 대사, 판타지 주문 등에 사용됩니다."
          openDelay={500}
        >
          <Menu.Item
            onClick={onChangeToDoubleScytheBlock}
            {...getSelectedProps(BlockType.DoubleScythe)}
          >
            <BsCode />
            강조 블록 A
          </Menu.Item>
        </Tooltip>
        <Tooltip
          content="홑화살괄호(〈 〉)로 감싸진 블록입니다."
          openDelay={500}
        >
          <Menu.Item
            onClick={onChangeToSingleGuillemetBlock}
            {...getSelectedProps(BlockType.SingleGuillemet)}
          >
            <BsCode />
            용어 블록 B
          </Menu.Item>
        </Tooltip>
        <Tooltip
          content="겹화살괄호(《 》)로 감싸진 블록입니다."
          openDelay={500}
        >
          <Menu.Item
            onClick={onChangeToDoubleGuillemetBlock}
            {...getSelectedProps(BlockType.DoubleGuillemet)}
          >
            <BsCode />
            강조 블록 B
          </Menu.Item>
        </Tooltip>
      </Menu.ItemGroup>
      <Menu.ItemGroup>
        <Menu.ItemGroupLabel>블록 액션</Menu.ItemGroupLabel>
        <Menu.Item color="red.500" onClick={onDelete} value={"delete"}>
          <AiTwotoneDelete />
          삭제하기
        </Menu.Item>
      </Menu.ItemGroup>
    </Menu.Content>
  )
}

export default ActionMenuList
