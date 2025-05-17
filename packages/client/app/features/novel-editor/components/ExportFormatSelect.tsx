import {
  createListCollection,
  HStack,
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
import { useMemo } from "react"
import { FaClipboard } from "react-icons/fa"
import { ExportFormat } from "~/types/exportFormat"

const formats = [
  {
    label: "클립보드에 복사하기",
    value: ExportFormat.Clipboard,
    icon: <FaClipboard />,
  },
  { label: "HTML", value: ExportFormat.Html, icon: <FaClipboard /> },
  {
    label: "KoPubWorld 바탕체",
    value: ExportFormat.PlainText,
    icon: <FaClipboard />,
  },
]

const ExportFormatSelect = ({
  value,
  onChange,
}: {
  value: string
  onChange: (value: ExportFormat) => void
}) => {
  const formatCollection = useMemo(
    () => createListCollection({ items: formats }),
    [formats],
  )

  return (
    <SelectRoot
      w={"100%"}
      collection={formatCollection}
      value={[value]}
      onValueChange={({ value }) => {
        onChange(value[0] as ExportFormat)
      }}
    >
      <SelectHiddenSelect />
      <SelectControl>
        <SelectTrigger>
          <SelectValueText placeholder="내보내기 포맷 선택" />
        </SelectTrigger>
        <SelectIndicatorGroup>
          <SelectIndicator />
        </SelectIndicatorGroup>
      </SelectControl>
      <SelectPositioner>
        <SelectContent>
          {formatCollection.items.map((item) => (
            <SelectItem key={item.value} item={item}>
              <HStack>
                {item.icon}
                {item.label}
              </HStack>
              <SelectItemIndicator />
            </SelectItem>
          ))}
        </SelectContent>
      </SelectPositioner>
    </SelectRoot>
  )
}

export default ExportFormatSelect
