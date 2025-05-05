import {
  Box,
  createListCollection,
  Input,
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
} from "@chakra-ui/react"
import { useEffect, useMemo, useState } from "react"
import { usePlatform } from "~/hooks/usePlatform"

const CUSTOM_VALUE = "__custom__"

const predefinedFonts = [
  { label: "Pretendard Variable", value: '"Pretendard Variable"' },
  { label: "리디바탕", value: "RIDIBatang" },
  { label: "KoPubWorld 바탕체", value: "KoPubWorldBatang" },
  // { label: "굴림", value: "Gulim" },
  // { label: "돋움", value: "Dotum" },
]

const FontFamilySelect = ({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) => {
  const { isTauri } = usePlatform()
  const [customValue, setCustomValue] = useState("")
  const [extraFonts, setExtraFonts] = useState<
    { label: string; value: string }[]
  >([])

  const allFonts = useMemo(
    () => [
      ...predefinedFonts,
      ...extraFonts,
      { label: "사용자 설정...", value: CUSTOM_VALUE },
    ],
    [extraFonts],
  )

  const fontFamilyCollection = useMemo(
    () => createListCollection({ items: allFonts }),
    [allFonts],
  )

  const isPredefined = useMemo(
    () => allFonts.some((item) => item.value === value),
    [value, allFonts],
  )

  const selectedValue = isPredefined ? value : CUSTOM_VALUE

  useEffect(() => {
    if (!isPredefined) {
      setCustomValue(value)
    }
  }, [isPredefined, value])

  useEffect(() => {
    if (isTauri) {
      ;(async () => {
        const { invoke } = await import("@tauri-apps/api/core")
        try {
          const fonts = await invoke<string[]>("get_system_fonts")
          const mapped = (fonts as string[])
            .filter((f) => !!f && isNaN(Number(f))) // 간단한 필터
            .map((font) => ({ label: font, value: font }))
          setExtraFonts(mapped)
        } catch (e) {
          console.warn("시스템 폰트 로딩 실패", e)
        }
      })()
    }
  }, [isTauri])

  return (
    <Box w="100%">
      <SelectRoot
        w={"100%"}
        collection={fontFamilyCollection}
        value={[selectedValue]}
        onValueChange={({ value }) => {
          if (value[0] === CUSTOM_VALUE) {
            onChange(customValue)
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
