import {
  Button,
  CloseButton,
  createListCollection,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
  Field,
  Portal,
  Select,
  Slider,
  Stack,
} from "@chakra-ui/react"
import { useOption } from "~/context/OptionContext"
import { defaultOption } from "~/providers/OptionProvider"
import FontFamilySelect from "./FontFamilySelect"

const fontFamilies = [
  { label: "리디바탕", value: "RIDIBatang" },
  { label: "Noto Sans KR", value: "Noto Sans KR" },
  { label: "Pretendard", value: "Pretendard" },
]

const fontFamilyCollection = createListCollection({
  items: fontFamilies,
})

const OptionDrawer = () => {
  const [option, setOption] = useOption()

  const handleReset = () => setOption(() => defaultOption)

  return (
    <DrawerRoot>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          🛠 옵션
        </Button>
      </DrawerTrigger>
      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent>
          <DrawerCloseTrigger asChild>
            <CloseButton size="sm" position="absolute" top="4" right="4" />
          </DrawerCloseTrigger>
          <DrawerHeader>
            <DrawerTitle>에디터 옵션</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <Stack gap="6">
              {/* 폰트 선택 */}
              <Field.Root>
                <Field.Label>글꼴</Field.Label>
                <FontFamilySelect
                  value={option.fontFamily}
                  onChange={(v) =>
                    setOption((draft) => {
                      draft.fontFamily = v
                    })
                  }
                />
              </Field.Root>

              {/* 폰트 크기 */}
              <Field.Root>
                <Field.Label>폰트 크기 ({option.fontSize}px)</Field.Label>
                <Slider.Root
                  w={"100%"}
                  defaultValue={[option.fontSize]}
                  min={12}
                  max={24}
                  step={1}
                  onValueChange={({ value }) =>
                    setOption((draft) => {
                      draft.fontSize = value[0]
                    })
                  }
                >
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Range />
                    </Slider.Track>
                    <Slider.Thumb index={0} />
                  </Slider.Control>
                </Slider.Root>
              </Field.Root>

              {/* 줄 간격 */}
              <Field.Root>
                <Field.Label>줄 간격 ({option.lineHeight})</Field.Label>
                <Slider.Root
                  w={"100%"}
                  defaultValue={[option.lineHeight]}
                  min={1.2}
                  max={2.4}
                  step={0.05}
                  onValueChange={({ value }) =>
                    setOption((draft) => {
                      draft.lineHeight = value[0]
                    })
                  }
                >
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Range />
                    </Slider.Track>
                    <Slider.Thumb index={0} />
                  </Slider.Control>
                </Slider.Root>
              </Field.Root>
            </Stack>

            {JSON.stringify(option)}
          </DrawerBody>

          <DrawerFooter justifyContent="space-between">
            <Button variant="outline" onClick={handleReset}>
              초기화
            </Button>
            <Button colorScheme="blue" type="button">
              닫기
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRoot>
  )
}

export default OptionDrawer
