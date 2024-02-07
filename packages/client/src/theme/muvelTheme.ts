import colors from "./colors"
import { extendTheme } from "@chakra-ui/react"
import components from "./components"

export default extendTheme({
  colors,
  components,
  initialColorMode: "dark",
  useSystemColorMode: false,
  config: {
    disableTransitionOnChange: false,
  },
})
