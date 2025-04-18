import React from "react"
import { Widget, WidgetBody, WidgetHeader } from "./Widget"
import { Button, HStack, Text } from "@chakra-ui/react"
import { RiCharacterRecognitionFill } from "react-icons/ri"
import { Tooltip } from "~/components/ui/tooltip"
import { toaster } from "~/components/ui/toaster"

const SymbolButton: React.FC<{ value: string; label: string }> = ({
  value,
  label,
}) => {
  const onClick = () => {
    navigator.clipboard.writeText(value).then()
    toaster.success({
      title: `클립보드에 복사했습니다.`,
      duration: 1000,
    })
  }

  return (
    <Tooltip content={label}>
      <Button size={"sm"} w="5px" onClick={onClick}>
        {value}
      </Button>
    </Tooltip>
  )
}

const SymbolWidget: React.FC = () => {
  const symbols: { value: string; name: string }[] = [
    { value: "—", name: "줄표" },
    { value: "·", name: "가운뎃점" },
    { value: "〈", name: "홑화살괄호 열기" },
    { value: "〉", name: "홑화살괄호 닫기" },
    { value: "《", name: "겹화살괄호 열기" },
    { value: "》", name: "겹화살괄호 닫기" },
    { value: "「", name: "홑낫표 열기" },
    { value: "」", name: "홑낫표 닫기" },
    { value: "『", name: "겹낫표 열기" },
    { value: "』", name: "겹낫표 닫기" },
    { value: "…", name: "말줄임표" },
    { value: "‽", name: "물음느낌표" },
    { value: "¿", name: "역물음표" },
    { value: "¡", name: "역느낌표" },
    { value: "†", name: "칼표 (십자가)" },
  ]

  return (
    <Widget>
      <WidgetHeader>
        <RiCharacterRecognitionFill size={16} />
        <Text>특수문자 위젯</Text>
      </WidgetHeader>
      <WidgetBody>
        <HStack flexWrap={"wrap"} w="110%" h="80px" overflowY={"auto"}>
          {symbols.map((symbol, idx) => (
            <SymbolButton key={idx} value={symbol.value} label={symbol.name} />
          ))}
        </HStack>
      </WidgetBody>
    </Widget>
  )
}

export default SymbolWidget
