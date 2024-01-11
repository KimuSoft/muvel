import colors from "./colors"
import { extendTheme } from "@chakra-ui/react"

export default extendTheme({
  colors,
  initialColorMode: "dark",
  useSystemColorMode: false,
  config: {
    disableTransitionOnChange: false,
  },
})
