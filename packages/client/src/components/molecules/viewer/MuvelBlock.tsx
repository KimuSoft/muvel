import { Block, BlockType } from "../../../types/block.type"
import { FC, useMemo } from "react"
import { Text, theme, useColorMode } from "@chakra-ui/react"
import { editorOptionsState } from "../../../recoil/editor"
import { useRecoilState } from "recoil"

const MuvelBlock: FC<{
  block: Block
}> = ({ block }) => {
  const [option] = useRecoilState(editorOptionsState)

  const { colorMode } = useColorMode()

  const style = useMemo(() => {
    switch (block.blockType) {
      case BlockType.Comment:
        return {
          color: theme.colors.gray["500"],
          backgroundColor:
            colorMode === "light"
              ? theme.colors.gray["100"]
              : theme.colors.gray["900"],
        }
      default:
        return {
          padding: `${option.gap / 2}px 0`,
          fontSize: option.fontSize + "px",
          lineHeight: option.lineHeight + "px",
          textIndent: option.indent + "em",
          color:
            colorMode === "light"
              ? theme.colors.gray["700"]
              : theme.colors.gray["300"],
          fontWeight: colorMode === "light" ? 500 : 50,
        }
    }
  }, [option, colorMode, block.blockType])

  return (
    <Text className="block" style={style}>
      {block.content}
    </Text>
  )
}

export default MuvelBlock
