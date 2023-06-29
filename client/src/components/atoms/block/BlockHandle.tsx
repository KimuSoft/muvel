import React, { useContext } from "react"
import { Block, BlockType } from "../../../types/block.type"
import styled from "styled-components"
import {
  forwardRef,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  theme,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react"
import {
  BiSolidCommentDots,
  BiSolidQuoteLeft,
  BiSolidQuoteSingleLeft,
} from "react-icons/bi"
import { MdDescription } from "react-icons/md"
import EditorContext from "../../../context/EditorContext"
import { AiTwotoneDelete } from "react-icons/ai"
import { RxDragHandleDots2 } from "react-icons/rx"
import { SortableHandle } from "react-sortable-hoc"
import { BsCode } from "react-icons/bs"

const BlockHandle = SortableHandle<{ block: Block }>(
  ({ block, onClick }: { block: Block; onClick(): void }) => (
    <_BlockHandle block={block} onClick={onClick} />
  )
)

const _BlockHandle: React.FC<{ block: Block; onClick(): void }> = ({
  block,
  onClick,
}) => {
  const { setBlocks } = useContext(EditorContext)

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
    <Menu>
      {({ isOpen }) => (
        <>
          <MenuButton as={Handle} block={block} onClick={onClick} />
          {isOpen && (
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
                <Tooltip
                  label="홑화살괄호(〈 〉)로 감싸진 블록입니다."
                  openDelay={500}
                >
                  <MenuItem
                    icon={<BsCode />}
                    onClick={onChangeToSingleGuillemetBlock}
                    {...getSelectedProps(BlockType.SingleGuillemet)}
                  >
                    용어 블록 B
                  </MenuItem>
                </Tooltip>
                <Tooltip
                  label="겹화살괄호(《 》)로 감싸진 블록입니다."
                  openDelay={500}
                >
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
                <MenuItem
                  icon={<AiTwotoneDelete />}
                  color="red.500"
                  onClick={onDelete}
                >
                  삭제하기
                </MenuItem>
              </MenuGroup>
            </MenuList>
          )}
        </>
      )}
    </Menu>
  )
}

const Handle = forwardRef<{ block: Block; onClick(): never }, "div">(
  ({ block, onClick }, ref) => {
    const { colorMode } = useColorMode()

    return (
      <HandleContainer onClick={onClick} ref={ref}>
        {block.blockType !== BlockType.DoubleQuote ? (
          <HandleButton colorMode={colorMode} className="block-handle">
            <RxDragHandleDots2 />
          </HandleButton>
        ) : (
          <HandleButton colorMode={colorMode} className="block-handle">
            <RxDragHandleDots2 />
          </HandleButton>
          // <ProfileHandle /> 일단 비활성화
        )}
      </HandleContainer>
    )
  }
)

const HandleButton = styled.div<{ colorMode: "light" | "dark" }>`
  width: 32px;
  height: 32px;

  display: flex;
  justify-content: center;
  align-items: center;

  color: ${theme.colors.gray["400"]};
  opacity: 0;

  &.active {
    color: ${({ colorMode }) =>
      colorMode === "light" ? "gray.500" : "gray.300"};
  }
`

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

export default BlockHandle
