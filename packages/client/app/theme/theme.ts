import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineTokens,
} from "@chakra-ui/react"

const fonts = defineTokens.fonts({
  body: {
    value: `Inter, "Pretendard Variable", -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Apple SD Gothic Neo', 'Noto Sans KR', Arial, sans-serif`,
  },
  heading: {
    value: `Inter, "Pretendard Variable", -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Apple SD Gothic Neo', 'Noto Sans KR', Arial, sans-serif`,
  },
})

const config = defineConfig({
  theme: {
    tokens: { fonts },
  },
})

export default createSystem(defaultConfig, config)
