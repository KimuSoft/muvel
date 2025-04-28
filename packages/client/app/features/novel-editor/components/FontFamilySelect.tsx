import {
  createListCollection,
  SelectContent,
  SelectControl,
  SelectHiddenSelect,
  SelectIndicator,
  SelectIndicatorGroup,
  SelectItem,
  SelectItemIndicator,
  SelectPositioner,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  Input, // 추가: 사용자 입력용
  Box, // 추가: 감싸는 용
} from "@chakra-ui/react"
import { useMemo, useState, useEffect } from "react"

const predefinedFonts = [
  { label: "리디바탕", value: "RIDIBatang" },
  { label: "KoPubWorld 바탕체", value: "KoPubWorldBatang" },
  { label: "Inter", value: "Inter" },
  { label: "Pretendard", value: "Pretendard" },
  { label: "굴림", value: "Gulim" },
  { label: "돋움", value: "Dotum" },
]

const CUSTOM_VALUE = "__custom__"

const fontFamilyCollection = createListCollection({
  items: [...predefinedFonts, { label: "사용자 설정...", value: CUSTOM_VALUE }],
})

const FontFamilySelect = ({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) => {
  // 사용자가 직접 입력하는 custom value
  const [customValue, setCustomValue] = useState("")

  // 현재 value가 predefinedFonts 안에 있는지 확인
  const isPredefined = useMemo(
    () => predefinedFonts.some((item) => item.value === value),
    [value],
  )

  const selectedValue = isPredefined ? value : CUSTOM_VALUE

  useEffect(() => {
    if (!isPredefined) {
      setCustomValue(value) // 외부에서 직접 value가 넘어온 경우 세팅
    }
  }, [isPredefined, value])

  return (
    <Box w="100%">
      <SelectRoot
        w={"100%"}
        collection={fontFamilyCollection}
        value={[selectedValue]}
        onValueChange={({ value }) => {
          if (value[0] === CUSTOM_VALUE) {
            onChange(customValue) // 인풋 수정하도록 유도
          } else {
            onChange(value[0])
          }
        }}
      >
        <SelectHiddenSelect />
        <SelectControl>
          <SelectTrigger>
            <SelectValueText placeholder="폰트 선택" />
          </SelectTrigger>
          <SelectIndicatorGroup>
            <SelectIndicator />
          </SelectIndicatorGroup>
        </SelectControl>
        <SelectPositioner>
          <SelectContent>
            {fontFamilyCollection.items.map((item) => (
              <SelectItem key={item.value} item={item}>
                {item.label}
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectContent>
        </SelectPositioner>
      </SelectRoot>

      {/* 사용자 설정 input 보여주기 */}
      {selectedValue === CUSTOM_VALUE && (
        <Input
          mt={2}
          placeholder="폰트 이름 입력"
          value={customValue}
          onChange={(e) => {
            const newCustomValue = e.target.value
            setCustomValue(newCustomValue)
            onChange(newCustomValue)
          }}
        />
      )}
    </Box>
  )
}

export default FontFamilySelect
