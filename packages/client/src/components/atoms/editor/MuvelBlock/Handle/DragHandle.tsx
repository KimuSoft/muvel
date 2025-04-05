import styled from "styled-components"
import { forwardRef, useColorMode } from "@chakra-ui/react"
import { Block, BlockType } from "../../../../../types/block.type"
import { RxDragHandleDots2 } from "react-icons/rx"

const DragHandle = forwardRef<{ block: Block; onClick(): never }, "div">(
  ({ block, onClick }, ref) => {
    const { colorMode } = useColorMode()

    return (
      <HandleContainer onClick={onClick} ref={ref}>
        {block.blockType !== BlockType.DoubleQuote ? (
          <HandleButtonStyle $color_mode={colorMode} className="block-handle">
            <RxDragHandleDots2 />
          </HandleButtonStyle>
        ) : (
          <HandleButtonStyle $color_mode={colorMode} className="block-handle">
            <RxDragHandleDots2 />
          </HandleButtonStyle>
          // <ProfileHandle /> 일단 비활성화
        )}
      </HandleContainer>
    )
  }
)

const HandleButtonStyle = styled.div<{ $color_mode: "light" | "dark" }>`
  width: 32px;
  height: 32px;

  display: flex;
  justify-content: center;
  align-items: center;

  color: var(--chakra-colors-gray-500);
  opacity: 0;
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
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
`

export default DragHandle
