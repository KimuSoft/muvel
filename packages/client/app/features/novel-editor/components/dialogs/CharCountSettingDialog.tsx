import React, { type PropsWithChildren, useCallback, useState } from "react"
import {
  Button,
  Checkbox,
  CloseButton,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Field,
  Group,
  HStack,
  Icon,
  NumberInput,
  Portal,
  RadioCard,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useWidgetOption } from "~/features/novel-editor/widgets/context/WidgetContext" // 경로 수정 필요
import { GoNumber } from "react-icons/go"
// --- 아이콘 임포트 ---
import { RiLetterSpacing2 } from "react-icons/ri"
import { BsAlphabet } from "react-icons/bs"
import { PiParagraphFill } from "react-icons/pi"
import { IoDocumentTextOutline } from "react-icons/io5"
import { defaultCharCountOptions } from "~/features/novel-editor/widgets/components/CharCountWidget"

// --- 타입 및 Enum 정의 ---
export enum CountUnit {
  Char = 0,
  Word = 1,
  Sentence = 2,
  KB = 3,
}

export interface CharCountWidgetOptions {
  unit: CountUnit
  excludeSpaces: boolean
  excludePunctuations: boolean
  excludeSpecialChars: boolean
  targetGoal: number
  showConfetti: boolean
}

const WIDGET_ID = "charCount"

const presets: Record<string, Partial<CharCountWidgetOptions>> = {
  novelpia: {
    unit: CountUnit.Char,
    excludeSpaces: true,
    excludePunctuations: true,
    excludeSpecialChars: false,
    targetGoal: 3000,
  },
  munpia: {
    unit: CountUnit.Char,
    excludeSpaces: false,
    excludePunctuations: false,
    excludeSpecialChars: false,
    targetGoal: 5000,
  },
  kakaopage: {
    unit: CountUnit.Char,
    excludeSpaces: false,
    excludePunctuations: false,
    excludeSpecialChars: false,
    targetGoal: 5500,
  },
  joara: {
    unit: CountUnit.KB,
    excludeSpaces: false,
    excludePunctuations: false,
    excludeSpecialChars: false,
    targetGoal: 14,
  },
}

const unitItems = [
  { value: CountUnit.Char, title: "글자 수", icon: RiLetterSpacing2 },
  { value: CountUnit.Word, title: "단어 수", icon: BsAlphabet },
  { value: CountUnit.Sentence, title: "문장 수", icon: PiParagraphFill },
  { value: CountUnit.KB, title: "용량", icon: IoDocumentTextOutline },
]

const defaultGoalsByUnit = {
  [CountUnit.Char]: 3000,
  [CountUnit.Word]: 1000,
  [CountUnit.Sentence]: 50,
  [CountUnit.KB]: 14,
}

const unitSuffix: Record<CountUnit, string> = {
  [CountUnit.Char]: "자",
  [CountUnit.Word]: "단어",
  [CountUnit.Sentence]: "문장",
  [CountUnit.KB]: "KB",
}

// --- 설정 다이얼로그 컴포넌트 ---
export const CharCountSettingsDialog: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [options, setOptions] = useWidgetOption<CharCountWidgetOptions>(
    WIDGET_ID,
    defaultCharCountOptions,
  )
  const [isOpen, setIsOpen] = useState(false)

  const handleOptionChange = useCallback(
    <K extends keyof CharCountWidgetOptions>(
      key: K,
      value: CharCountWidgetOptions[K],
    ) => {
      setOptions((draft) => {
        draft[key] = value
        if (key === "unit") {
          const newUnit = value as CountUnit
          draft.targetGoal = defaultGoalsByUnit[newUnit]
          if (newUnit === CountUnit.Word || newUnit === CountUnit.Sentence) {
            draft.excludeSpaces = false
            draft.excludeSpecialChars = false
          }
        }
      })
    },
    [setOptions],
  )

  const applyPreset = useCallback(
    (presetName: keyof typeof presets) => {
      const presetValues = presets[presetName]
      setOptions((draft) => {
        Object.assign(draft, presetValues)
      })
    },
    [setOptions],
  )

  const isCheckboxEnabled =
    options?.unit === CountUnit.Char || options?.unit === CountUnit.KB // 옵셔널 체이닝 추가

  // NumberInput 변경 핸들러
  const handleGoalChange = (detail: {
    value: string
    valueAsNumber: number
  }) => {
    const newValue = isNaN(detail.valueAsNumber)
      ? 0
      : Math.max(0, Math.floor(detail.valueAsNumber))
    handleOptionChange("targetGoal", newValue)
  }

  // options가 로드되지 않았을 경우를 대비한 로딩 상태 (선택적)
  if (!options) {
    // 또는 스켈레톤 로딩 UI 반환
    return null
  }

  return (
    <DialogRoot open={isOpen} onOpenChange={(detail) => setIsOpen(detail.open)}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <Portal>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent>
            <DialogHeader>
              <GoNumber size={26} />
              <DialogTitle ml={1}>글자 수 세기 설정</DialogTitle>
              <DialogCloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top="3" right="4" />
              </DialogCloseTrigger>
            </DialogHeader>

            <DialogBody>
              <Stack gap={6}>
                {/* 프리셋 섹션 */}
                <Stack gap={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    프리셋
                  </Text>
                  <Group>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyPreset("novelpia")}
                    >
                      노벨피아
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyPreset("munpia")}
                    >
                      문피아
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyPreset("kakaopage")}
                    >
                      카카오페이지
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyPreset("joara")}
                    >
                      조아라
                    </Button>
                  </Group>
                </Stack>

                {/* 단위 선택 섹션 */}
                <RadioCard.Root
                  // === 수정: options.unit이 undefined일 경우 기본값 사용 ===
                  value={(
                    options.unit ?? defaultCharCountOptions.unit
                  ).toString()}
                  // ====================================================
                  onValueChange={(detail) =>
                    handleOptionChange(
                      "unit",
                      parseInt(detail.value || "0", 10) as CountUnit,
                    )
                  }
                >
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    단위 선택
                  </Text>
                  <HStack align="stretch" gap={2}>
                    {unitItems.map((item) => (
                      <RadioCard.Item
                        key={item.value}
                        value={item.value.toString()}
                        flex={1}
                      >
                        <RadioCard.ItemHiddenInput />
                        <RadioCard.ItemControl textAlign="center">
                          <RadioCard.ItemContent>
                            <Icon fontSize="2xl" color="fg.muted" mb="2">
                              <item.icon />
                            </Icon>
                            <RadioCard.ItemText fontSize="xs">
                              {item.title}
                            </RadioCard.ItemText>
                          </RadioCard.ItemContent>
                          <RadioCard.ItemIndicator />
                        </RadioCard.ItemControl>
                      </RadioCard.Item>
                    ))}
                  </HStack>
                </RadioCard.Root>

                {/* 목표 분량 설정 */}
                <Field.Root>
                  <Field.Label fontSize="sm" fontWeight="medium">
                    편당 분량 목표 ({unitSuffix[options.unit]})
                  </Field.Label>
                  <NumberInput.Root
                    size="sm"
                    value={options.targetGoal.toString()}
                    onValueChange={handleGoalChange}
                    min={0}
                    step={options.unit === CountUnit.KB ? 1 : 100}
                  >
                    <NumberInput.Control />
                    <NumberInput.Input />
                  </NumberInput.Root>
                </Field.Root>

                {/* 상세 옵션 (체크박스) */}
                <VStack align="flex-start" gap={3}>
                  <Text fontSize="sm" fontWeight="medium">
                    상세 옵션
                  </Text>
                  <Checkbox.Root
                    size="md"
                    checked={options.excludeSpaces}
                    onCheckedChange={(details) =>
                      handleOptionChange("excludeSpaces", !!details.checked)
                    }
                    disabled={!isCheckboxEnabled}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>공백 제외하기</Checkbox.Label>
                  </Checkbox.Root>

                  <Checkbox.Root
                    size="md"
                    checked={options.excludePunctuations}
                    onCheckedChange={(details) =>
                      handleOptionChange(
                        "excludePunctuations",
                        !!details.checked,
                      )
                    }
                    disabled={!isCheckboxEnabled}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>문장부호 제외하기</Checkbox.Label>
                  </Checkbox.Root>

                  <Checkbox.Root
                    size="md"
                    checked={options.excludeSpecialChars}
                    onCheckedChange={(details) =>
                      handleOptionChange(
                        "excludeSpecialChars",
                        !!details.checked,
                      )
                    }
                    disabled={!isCheckboxEnabled}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>특수문자 제외하기</Checkbox.Label>
                  </Checkbox.Root>

                  <Checkbox.Root
                    size="md"
                    checked={options.showConfetti}
                    onCheckedChange={(details) =>
                      handleOptionChange("showConfetti", !!details.checked)
                    }
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>목표 달성 시 폭죽 터뜨리기</Checkbox.Label>
                  </Checkbox.Root>
                </VStack>
              </Stack>
            </DialogBody>
            {/* Footer 제거됨 */}
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </DialogRoot>
  )
}
