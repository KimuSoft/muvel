import React from "react"
import { IconButton, useColorMode } from "@chakra-ui/react"
import { BsFillMoonFill, BsFillSunFill } from "react-icons/all"

const ToggleColorModeButton: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <IconButton aria-label={"change color mode"} onClick={toggleColorMode}>
      {colorMode === "light" ? (
        <BsFillSunFill style={{ fontSize: 16 }} />
      ) : (
        <BsFillMoonFill style={{ fontSize: 16 }} />
      )}
    </IconButton>
  )
}

export default ToggleColorModeButton
