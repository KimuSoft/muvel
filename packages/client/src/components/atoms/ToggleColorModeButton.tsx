import React from "react"
import {
  IconButton,
  IconButtonProps,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react"
import { TbMoonFilled, TbSunFilled } from "react-icons/tb"

const ToggleColorModeButton: React.FC<Omit<IconButtonProps, "aria-label">> = (
  props
) => {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Tooltip
      label={`${colorMode === "light" ? "어두운" : "밝은"} 테마로 전환하기`}
      openDelay={500}
    >
      <IconButton
        aria-label={"change color mode"}
        onClick={toggleColorMode}
        variant="ghost"
        {...props}
      >
        {colorMode === "light" ? <TbSunFilled /> : <TbMoonFilled />}
      </IconButton>
    </Tooltip>
  )
}

export default ToggleColorModeButton
