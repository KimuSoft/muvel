import React from "react"
import {
  HStack,
  IconButton,
  Spacer,
  Spinner,
  type StackProps,
} from "@chakra-ui/react"
import OptionDrawer from "~/features/editor/components/OptionDrawer"
import { ColorModeButton } from "~/components/ui/color-mode"
import { FaChevronLeft } from "react-icons/fa"
import { useNavigate } from "react-router"
import { BiSolidWidget } from "react-icons/bi"
import { FaList } from "react-icons/fa6"
import { Tooltip } from "~/components/ui/tooltip"

const EditorHeader: React.FC<
  StackProps & { novelId: string; isAutoSaving: boolean }
> = ({ novelId, isAutoSaving, ...props }) => {
  const navigate = useNavigate()

  return (
    <HStack
      position={"fixed"}
      top={0}
      left={0}
      px={5}
      w={"100%"}
      h={"70px"}
      zIndex={100}
      {...props}
    >
      <Tooltip content={"소설 페이지로 돌아가기"} openDelay={100} showArrow>
        <IconButton
          variant="ghost"
          aria-label="back"
          onClick={() => {
            navigate(`/novels/${novelId}`)
          }}
        >
          <FaChevronLeft />
        </IconButton>
      </Tooltip>
      <Tooltip content={"에피소드 리스트"} openDelay={100} showArrow>
        <IconButton variant="ghost" aria-label="back">
          <FaList />
        </IconButton>
      </Tooltip>
      {isAutoSaving && <Spinner colorPalette={"purple"} />}
      <Spacer />

      {/*<Tooltip content={"위젯 설정하기"} openDelay={100} showArrow>*/}
      <IconButton variant="ghost" aria-label="back">
        <BiSolidWidget />
      </IconButton>
      {/*</Tooltip>*/}
      <OptionDrawer />
      <ColorModeButton />
    </HStack>
  )
}

export default EditorHeader
