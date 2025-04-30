import {
  Button,
  CloseButton,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerRootProvider,
  DrawerTitle,
  DrawerTrigger,
  Field,
  Link,
  Separator,
  SimpleGrid,
  Slider,
  Stack,
  Text,
  type UseDialogReturn,
} from "@chakra-ui/react"
import { useOption } from "~/context/OptionContext"
import { defaultOption } from "~/providers/OptionProvider"
import FontFamilySelect from "../FontFamilySelect"
import OptionColorPicker from "~/features/novel-editor/components/ColorPicker"
import {
  joaraPreset,
  kakaopagePreset,
  muvelMobilePreset,
  novelpiaDesktopPreset,
  novelpiaMobilePreset,
} from "~/features/novel-editor/style/stylePreset"
import { FaDesktop, FaMobile } from "react-icons/fa6"
import { SiKakao } from "react-icons/si"
import { useColorMode } from "~/components/ui/color-mode"
import React, { type ReactNode } from "react"

const OptionDrawer: React.FC<{
  children?: ReactNode
  dialog: UseDialogReturn
}> = ({ children, dialog }) => {
  const [option, setOption] = useOption()
  const { setColorMode } = useColorMode()

  const handleReset = () => setOption(() => defaultOption)

  return (
    <DrawerRootProvider value={dialog}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}

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
            <Stack gap={3}>
              <Text>프리셋</Text>
              <SimpleGrid w={"100%"} columns={2} gap={2}>
                <Button
                  size={"sm"}
                  colorPalette={"purple"}
                  onClick={() =>
                    setOption((option) => ({
                      ...option,
                      ...defaultOption,
                    }))
                  }
                >
                  <FaDesktop />
                  뮤블
                </Button>
                <Button
                  size={"sm"}
                  colorPalette={"purple"}
                  onClick={() =>
                    setOption((option) => ({
                      ...option,
                      ...muvelMobilePreset,
                    }))
                  }
                >
                  <FaMobile />
                  뮤블
                </Button>
                <Button
                  size={"sm"}
                  onClick={() => {
                    setOption((option) => ({
                      ...option,
                      ...novelpiaDesktopPreset,
                    }))
                    setColorMode("light")
                  }}
                >
                  <FaDesktop />
                  노벨피아
                </Button>
                <Button
                  size={"sm"}
                  onClick={() => {
                    setColorMode("light")
                    setOption((option) => ({
                      ...option,
                      ...novelpiaMobilePreset,
                    }))
                  }}
                >
                  <FaMobile />
                  노벨피아
                </Button>
                <Button
                  size={"sm"}
                  colorPalette={"yellow"}
                  onClick={() => {
                    setColorMode("light")
                    setOption((option) => ({
                      ...option,
                      ...kakaopagePreset,
                    }))
                  }}
                >
                  <SiKakao />
                  카카오페이지
                </Button>
                <Button
                  size={"sm"}
                  colorPalette={"blue"}
                  onClick={() => {
                    setColorMode("light")
                    setOption((option) => ({
                      ...option,
                      ...joaraPreset,
                    }))
                  }}
                >
                  <FaDesktop />
                  조아라
                </Button>
              </SimpleGrid>
            </Stack>
            <Separator my={5} />
            <Stack gap={6}>
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
                <Field.Label>글꼴 크기 ({option.fontSize}px)</Field.Label>
                <Slider.Root
                  w={"100%"}
                  value={[option.fontSize]}
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

              <Field.Root>
                <Field.Label>글꼴 두께 ({option.fontWeight})</Field.Label>
                <Slider.Root
                  w={"100%"}
                  value={[option.fontWeight]}
                  min={100}
                  max={900}
                  step={50}
                  onValueChange={({ value }) =>
                    setOption((draft) => {
                      draft.fontWeight = value[0]
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

              <Field.Root>
                <Field.Label>줄 간격 ({option.lineHeight})</Field.Label>
                <Slider.Root
                  w={"100%"}
                  value={[option.lineHeight]}
                  min={1}
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

              <Field.Root>
                <Field.Label>문단 간격 ({option.blockGap}px)</Field.Label>
                <Slider.Root
                  w={"100%"}
                  value={[option.blockGap]}
                  min={0}
                  max={20}
                  step={1}
                  onValueChange={({ value }) =>
                    setOption((draft) => {
                      draft.blockGap = value[0]
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

              <Field.Root>
                <Field.Label>들여쓰기 ({option.indent}em)</Field.Label>
                <Slider.Root
                  w={"100%"}
                  value={[option.indent]}
                  min={0}
                  max={2}
                  step={1}
                  onValueChange={({ value }) =>
                    setOption((draft) => {
                      draft.indent = value[0]
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

              <Field.Root>
                <Field.Label>
                  편집창 최대 너비 ({option.editorMaxWidth}px)
                </Field.Label>
                <Slider.Root
                  w={"100%"}
                  value={[option.editorMaxWidth]}
                  min={350}
                  max={3000}
                  step={10}
                  onValueChange={({ value }) =>
                    setOption((draft) => {
                      draft.editorMaxWidth = value[0]
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

              {/* 글 색상 */}
              <Field.Root>
                <Field.Label>글자 색상</Field.Label>

                {option.color && (
                  <Text color={"gray.500"} fontSize={"sm"}>
                    색상 변경 시 다크모드 및 화이트모드에 따라 글씨가 잘 보이지
                    않을 수 있습니다. 기본 설정으로 돌리려면{" "}
                    <Link
                      variant={"underline"}
                      onClick={() =>
                        setOption((draft) => {
                          draft.color = defaultOption.color
                        })
                      }
                      colorPalette={"purple"}
                    >
                      여기
                    </Link>
                    를 눌러주세요
                  </Text>
                )}
                <OptionColorPicker
                  defaultValue={option.color}
                  onChange={(v) =>
                    setOption((draft) => {
                      draft.color = v
                    })
                  }
                />
              </Field.Root>

              {/* 글 색상 */}
              <Field.Root>
                <Field.Label>배경 색상</Field.Label>

                {option.backgroundColor && (
                  <Text color={"gray.500"} fontSize={"sm"}>
                    색상 변경 시 다크모드 및 화이트모드에 따라 글씨가 잘 보이지
                    않을 수 있습니다. 기본 설정으로 돌리려면{" "}
                    <Link
                      variant={"underline"}
                      onClick={() =>
                        setOption((draft) => {
                          draft.backgroundColor = defaultOption.backgroundColor
                        })
                      }
                      colorPalette={"purple"}
                    >
                      여기
                    </Link>
                    를 눌러주세요
                  </Text>
                )}
                <OptionColorPicker
                  defaultValue={option.backgroundColor}
                  onChange={(v) =>
                    setOption((draft) => {
                      draft.backgroundColor = v
                    })
                  }
                />
              </Field.Root>
            </Stack>
            {/*{JSON.stringify(option)}*/}
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
    </DrawerRootProvider>
  )
}

export default OptionDrawer
