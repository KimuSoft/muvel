import {
  Button,
  Checkbox,
  CloseButton,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerPositioner,
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
import FontFamilySelect from "../FontFamilySelect"
import OptionColorPicker from "~/features/novel-editor/components/ColorPicker"
import {
  joaraPreset,
  kakaopagePreset,
  moonpiaDesktopPreset,
  muvelMobilePreset,
  novelpiaDesktopPreset,
  novelpiaMobilePreset,
} from "~/types/editorStylePresets"
import { FaDesktop, FaMobile } from "react-icons/fa6"
import { SiKakao } from "react-icons/si"
import { useColorMode } from "~/components/ui/color-mode"
import React, { type ReactNode } from "react"
import { BiReset } from "react-icons/bi"
import { useEditorStyleOptions } from "~/hooks/useAppOptions"
import { defaultEditorStyleOptions } from "~/types/defaultOptions"

const OptionDrawer: React.FC<{
  children?: ReactNode
  dialog: UseDialogReturn
}> = ({ children, dialog }) => {
  const [editorStyleOptions, setEditorStyleOptions, resetEditorStyleOptions] =
    useEditorStyleOptions()
  const { setColorMode } = useColorMode()

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
            <DrawerTitle>에디터 설정하기</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <Stack gap={3}>
              <Text>스타일 프리셋</Text>
              <SimpleGrid w={"100%"} columns={2} gap={2}>
                <Button
                  size={"sm"}
                  variant={"outline"}
                  colorPalette={"purple"}
                  onClick={() =>
                    setEditorStyleOptions((option) => ({
                      ...option,
                      ...muvelMobilePreset,
                    }))
                  }
                >
                  <FaMobile />
                  뮤블 모바일
                </Button>
                <Button
                  size={"sm"}
                  variant={"outline"}
                  colorPalette={"blue"}
                  onClick={() => {
                    setEditorStyleOptions((option) => ({
                      ...option,
                      ...moonpiaDesktopPreset,
                    }))
                    setColorMode("light")
                  }}
                >
                  <FaDesktop />
                  문피아
                </Button>
                <Button
                  size={"sm"}
                  variant={"outline"}
                  onClick={() => {
                    setEditorStyleOptions((option) => ({
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
                  variant={"outline"}
                  onClick={() => {
                    setColorMode("light")
                    setEditorStyleOptions((option) => ({
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
                  variant={"outline"}
                  colorPalette={"yellow"}
                  onClick={() => {
                    setColorMode("light")
                    setEditorStyleOptions((option) => ({
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
                  variant={"outline"}
                  colorPalette={"green"}
                  onClick={() => {
                    setColorMode("light")
                    setEditorStyleOptions((option) => ({
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
              <Field.Root>
                <Field.Label>에디터 조작</Field.Label>
                <Checkbox.Root
                  mt={5}
                  colorPalette="purple"
                  checked={editorStyleOptions.typewriter}
                  onCheckedChange={(d) =>
                    setEditorStyleOptions((draft) => {
                      draft.typewriter = !!d.checked
                    })
                  }
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>타입라이터 스크롤</Checkbox.Label>
                </Checkbox.Root>
                <Text color={"gray.500"} fontSize={"sm"}>
                  현재 글쓰는 곳을 화면 중앙으로 이동시킵니다.
                </Text>
              </Field.Root>
              <Field.Root>
                {editorStyleOptions.typewriter && (
                  <>
                    <Checkbox.Root
                      colorPalette="purple"
                      checked={editorStyleOptions.typewriterStrict}
                      onCheckedChange={(d) =>
                        setEditorStyleOptions((draft) => {
                          draft.typewriterStrict = !!d.checked
                        })
                      }
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label>엄격한 타입라이터</Checkbox.Label>
                    </Checkbox.Root>
                    <Text color={"gray.500"} fontSize={"sm"}>
                      실제 타이핑을 제외한 단순 위치 이동의 타입라이터 스크롤을
                      방지합니다.
                    </Text>{" "}
                  </>
                )}
              </Field.Root>

              {/* 폰트 선택 */}
              <Field.Root>
                <Field.Label>글꼴</Field.Label>
                <FontFamilySelect
                  value={editorStyleOptions.fontFamily}
                  onChange={(v) =>
                    setEditorStyleOptions((draft) => {
                      draft.fontFamily = v
                    })
                  }
                />
              </Field.Root>

              {/* 폰트 크기 */}
              <Field.Root>
                <Field.Label>
                  글꼴 크기 ({editorStyleOptions.fontSize}px)
                </Field.Label>
                <Slider.Root
                  w={"100%"}
                  value={[editorStyleOptions.fontSize]}
                  min={12}
                  max={24}
                  step={1}
                  onValueChange={({ value }) =>
                    setEditorStyleOptions((draft) => {
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
                <Field.Label>
                  글꼴 두께 ({editorStyleOptions.fontWeight})
                </Field.Label>
                <Slider.Root
                  w={"100%"}
                  value={[editorStyleOptions.fontWeight]}
                  min={100}
                  max={900}
                  step={50}
                  onValueChange={({ value }) =>
                    setEditorStyleOptions((draft) => {
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
                <Field.Label>
                  줄 간격 ({editorStyleOptions.lineHeight})
                </Field.Label>
                <Slider.Root
                  w={"100%"}
                  value={[editorStyleOptions.lineHeight]}
                  min={1}
                  max={2.4}
                  step={0.05}
                  onValueChange={({ value }) =>
                    setEditorStyleOptions((draft) => {
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
                <Field.Label>
                  문단 간격 ({editorStyleOptions.blockGap}px)
                </Field.Label>
                <Slider.Root
                  w={"100%"}
                  value={[editorStyleOptions.blockGap]}
                  min={0}
                  max={20}
                  step={1}
                  onValueChange={({ value }) =>
                    setEditorStyleOptions((draft) => {
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
                <Field.Label>
                  들여쓰기 ({editorStyleOptions.indent}em)
                </Field.Label>
                <Slider.Root
                  w={"100%"}
                  value={[editorStyleOptions.indent]}
                  min={0}
                  max={2}
                  step={1}
                  onValueChange={({ value }) =>
                    setEditorStyleOptions((draft) => {
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
                  편집창 최대 너비 ({editorStyleOptions.editorMaxWidth}px)
                </Field.Label>
                <Slider.Root
                  w={"100%"}
                  value={[editorStyleOptions.editorMaxWidth]}
                  min={350}
                  max={3000}
                  step={10}
                  onValueChange={({ value }) =>
                    setEditorStyleOptions((draft) => {
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

                {editorStyleOptions.color && (
                  <Text color={"gray.500"} fontSize={"sm"}>
                    색상 변경 시 다크모드 및 화이트모드에 따라 글씨가 잘 보이지
                    않을 수 있습니다. 기본 설정으로 돌리려면{" "}
                    <Link
                      variant={"underline"}
                      onClick={() =>
                        setEditorStyleOptions((draft) => {
                          draft.color = defaultEditorStyleOptions.color
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
                  defaultValue={editorStyleOptions.color}
                  onChange={(v) =>
                    setEditorStyleOptions((draft) => {
                      draft.color = v
                    })
                  }
                />
              </Field.Root>

              {/* 글 색상 */}
              <Field.Root>
                <Field.Label>배경 색상</Field.Label>

                {editorStyleOptions.backgroundColor && (
                  <Text color={"gray.500"} fontSize={"sm"}>
                    색상 변경 시 다크모드 및 화이트모드에 따라 글씨가 잘 보이지
                    않을 수 있습니다. 기본 설정으로 돌리려면{" "}
                    <Link
                      variant={"underline"}
                      onClick={() =>
                        setEditorStyleOptions((draft) => {
                          draft.backgroundColor =
                            defaultEditorStyleOptions.backgroundColor
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
                  defaultValue={editorStyleOptions.backgroundColor}
                  onChange={(v) =>
                    setEditorStyleOptions((draft) => {
                      draft.backgroundColor = v
                    })
                  }
                />
              </Field.Root>
            </Stack>
            {/*{JSON.stringify(option)}*/}
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" onClick={resetEditorStyleOptions}>
              <BiReset />
              초기화
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRootProvider>
  )
}

export default OptionDrawer
