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
} from "@chakra-ui/react"

const fontFamilyCollection = createListCollection({
  items: [
    { label: "리디바탕", value: "RIDIBatang" },
    { label: "KoPubWorld 바탕체", value: "KoPubWorldBatang" },
    { label: "Inter", value: "Inter" },
    { label: "Pretendard", value: "Pretendard" },
    // 굴림, 돋움
    { label: "굴림", value: "Gulim" },
    { label: "돋움", value: "Dotum" },
  ],
})

const FontFamilySelect = ({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) => {
  return (
    <SelectRoot
      w={"100%"}
      collection={fontFamilyCollection}
      value={[value]} // ✅ string[] 형태로
      onValueChange={({ value }) => {
        onChange(value[0]) // ✅ detail.value[0] 접근
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
  )
}

export default FontFamilySelect
