import React from "react"
import { IconButton, Tooltip, useColorMode } from "@chakra-ui/react"
import { BsFillMoonFill, BsFillSunFill } from "react-icons/bs"

const ToggleColorModeButton: React.FC = () => {
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
      >
        {colorMode === "light" ? (
          <BsFillSunFill style={{ fontSize: 16 }} />
        ) : (
          <BsFillMoonFill style={{ fontSize: 16 }} />
        )}
      </IconButton>
    </Tooltip>
  )
}

export default ToggleColorModeButton
