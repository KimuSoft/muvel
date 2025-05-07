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
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null)
  const [familyStyles, setFamilyStyles] = useState<
    { label: string; value: string }[]
  >([])
  const [fontStylesCache, setFontStylesCache] = useState<
    Record<string, { label: string; value: string }[]>
  >({})
  const [isLoading, setIsLoading] = useState(false)

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

  const fontStyleCollection = useMemo(
    () => createListCollection({ items: familyStyles }),
    [familyStyles],
  )

  const isPredefined = useMemo(
    () => predefinedFonts.some((item) => item.value === value),
    [value],
  )

  const isSystemFont = useMemo(
    () =>
      extraFonts.some(
        (font) => value.includes(font.value) || font.value.includes(value),
      ),
    [extraFonts, value],
  )

  const displayFamilyValue = useMemo(() => {
    if (isLoading && selectedFamily) return selectedFamily
    if (isPredefined) return value
    if (selectedFamily) return selectedFamily
    if (isSystemFont) {
      const matchingFamily = extraFonts.find((font) =>
        value.toLowerCase().includes(font.value.toLowerCase()),
      )
      return matchingFamily ? matchingFamily.value : CUSTOM_VALUE
    }
    return CUSTOM_VALUE
  }, [isPredefined, selectedFamily, value, isSystemFont, extraFonts, isLoading])

  const loadFamilyStyles = async (family: string) => {
    if (!isTauri) return

    setIsLoading(true)
    setSelectedFamily(family)

    try {
      if (fontStylesCache[family]) {
        const cachedStyles = fontStylesCache[family]
        setFamilyStyles(cachedStyles)

        if (cachedStyles.length > 0) {
          const defaultStyle = cachedStyles.find(
            (s) =>
              s.label === "기본" ||
              s.label === "Regular" ||
              s.label.includes("보통"),
          )
          onChange(defaultStyle ? defaultStyle.value : cachedStyles[0].value)
        }
        setIsLoading(false)
        return
      }

      const { invoke } = await import("@tauri-apps/api/core")
      const fonts = await invoke<string[]>("get_fonts_by_family", { family })
      const filteredFonts = (fonts as string[])
        .filter((font) => !!font && isNaN(Number(font)))
        .map((font) => ({
          label: font.trim() || "기본",
          value: font,
        }))

      setFontStylesCache((prev) => ({
        ...prev,
        [family]: filteredFonts,
      }))

      setFamilyStyles(filteredFonts)

      if (filteredFonts.length > 0) {
        const defaultStyle = filteredFonts.find(
          (s) =>
            s.label === "기본" ||
            s.label === "Regular" ||
            s.label.includes("보통"),
        )
        onChange(defaultStyle ? defaultStyle.value : filteredFonts[0].value)
      }
    } catch (e) {
      console.warn("시스템 폰트 패밀리 로딩 실패", e)
      setFamilyStyles([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isTauri) return
    ;(async () => {
      try {
        const { invoke } = await import("@tauri-apps/api/core")
        const fonts = await invoke<string[]>("get_system_font_families")
        const filteredFonts = (fonts as string[])
          .filter((font) => !!font && isNaN(Number(font)))
          .sort((a, b) => a.localeCompare(b, "ko"))
          .map((font) => ({ label: font, value: font }))

        setExtraFonts(filteredFonts)
      } catch (e) {
        console.warn("시스템 폰트 로딩 실패", e)
      }
    })()
  }, [isTauri])

  useEffect(() => {
    if (!isPredefined && !selectedFamily && value) {
      setCustomValue(value)
    }
  }, [isPredefined, selectedFamily, value])

  useEffect(() => {
    if (isLoading || isPredefined) return
    if (selectedFamily && familyStyles.some((style) => style.value === value)) {
      return
    }
    if (isSystemFont && !selectedFamily) {
      const matchingFamily = extraFonts.find((font) =>
        value.toLowerCase().includes(font.value.toLowerCase()),
      )
      if (matchingFamily) {
        loadFamilyStyles(matchingFamily.value)
      }
    }
  }, [
    value,
    isPredefined,
    isSystemFont,
    selectedFamily,
    familyStyles,
    extraFonts,
    isLoading,
  ])

  return (
    <Box w="100%">
      <SelectRoot
        w={"100%"}
        collection={fontFamilyCollection}
        value={[displayFamilyValue]}
        onValueChange={({ value }) => {
          if (isLoading) return
          const selectedValue = value[0]

          if (selectedValue === CUSTOM_VALUE) {
            setSelectedFamily(null)
            setFamilyStyles([])
            onChange(customValue)
          } else {
            const isPredefined = predefinedFonts.some(
              (font) => font.value === selectedValue,
            )

            if (isPredefined) {
              setSelectedFamily(null)
              setFamilyStyles([])
              onChange(selectedValue)
            } else {
              loadFamilyStyles(selectedValue)
            }
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

      {selectedFamily && familyStyles.length > 1 && (
        <SelectRoot
          w={"100%"}
          mt={2}
          collection={fontStyleCollection}
          value={[value]}
          onValueChange={({ value }) => {
            if (value[0]) {
              onChange(value[0])
            }
          }}
        >
          <SelectHiddenSelect />
          <SelectControl>
            <SelectTrigger>
              <SelectValueText placeholder="스타일 선택" />
            </SelectTrigger>
            <SelectIndicatorGroup>
              <SelectIndicator />
            </SelectIndicatorGroup>
          </SelectControl>
          <SelectPositioner>
            <SelectContent>
              {fontStyleCollection.items.map((item) => (
                <SelectItem key={item.value} item={item}>
                  {item.label}
                  <SelectItemIndicator />
                </SelectItem>
              ))}
            </SelectContent>
          </SelectPositioner>
        </SelectRoot>
      )}

      {displayFamilyValue === CUSTOM_VALUE && (
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
