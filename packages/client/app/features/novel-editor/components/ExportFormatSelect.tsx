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
  Tag,
  Text,
} from "@chakra-ui/react"
import { useMemo } from "react"
import { ExportFormat } from "~/types/exportFormat"
import { FaCopy } from "react-icons/fa6"
import {
  TbAlphabetKorean,
  TbHtml,
  TbJson,
  TbMarkdown,
  TbTxt,
} from "react-icons/tb"
import { RiQuillPenFill } from "react-icons/ri"

const formats = [
  {
    label: "클립보드에 복사하기",
    value: ExportFormat.Clipboard,
    icon: <FaCopy />,
  },
  {
    label: "텍스트 파일",
    value: ExportFormat.PlainText,
    icon: <TbTxt />,
    ext: ".txt",
  },
  {
    label: "마크다운 문서",
    value: ExportFormat.Markdown,
    icon: <TbMarkdown />,
    ext: ".md",
  },
  // {
  //   label: "MS Word 문서",
  //   value: ExportFormat.MSWord,
  //   icon: <PiMicrosoftWordLogo />,
  //   ext: ".docx",
  // },
  // {
  //   label: "한글과컴퓨터 문서",
  //   value: ExportFormat.Hangul,
  //   icon: <TbAlphabetKorean />,
  //   ext: ".hwpx",
  // },
  // {
  //   label: "PDF 문서",
  //   value: ExportFormat.PDF,
  //   icon: <BsFilePdf />,
  //   ext: ".pdf",
  // },
  {
    label: "HTML",
    value: ExportFormat.Html,
    icon: <TbHtml />,
    ext: ".html",
  },
  // {
  //   label: "Rich Text",
  //   value: ExportFormat.RichText,
  //   icon: <BsFileEarmarkRichtext />,
  //   ext: ".rtf",
  //   platforms: ["Scrivener"],
  // },
  // {
  //   label: "오픈 문서 포맷",
  //   value: ExportFormat.LibreOffice,
  //   icon: <SiLibreoffice />,
  //   ext: ".odt",
  //   platforms: ["LibreOffice", "OpenOffice"],
  // },
  // {
  //   label: "표준 전자책 문서",
  //   value: ExportFormat.Epub,
  //   icon: <IoMdBook />,
  //   ext: ".epub",
  // },
  {
    label: "JSON",
    value: ExportFormat.Json,
    icon: <TbJson />,
    ext: ".json",
  },
  {
    label: "뮤블 에피소드 포맷",
    value: ExportFormat.Mvle,
    icon: <RiQuillPenFill />,
    ext: ".mvle",
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
              <HStack flex={1}>
                {item.icon}
                <Text minW={"110px"}>{item.label}</Text>
                {item.ext && (
                  <Tag.Root size={"sm"}>
                    <Tag.Label> {item.ext}</Tag.Label>
                  </Tag.Root>
                )}
                <HStack gap={1}>
                  {/*{item.platforms?.map((p) => (*/}
                  {/*  <Tag.Root size={"sm"} colorPalette={"purple"}>*/}
                  {/*    <Tag.Label> {p}</Tag.Label>*/}
                  {/*  </Tag.Root>*/}
                  {/*))}*/}
                </HStack>
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
