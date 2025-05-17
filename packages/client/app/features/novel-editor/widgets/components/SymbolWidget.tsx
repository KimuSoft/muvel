import React from "react"
import {
  WidgetBase,
  WidgetHeader,
  WidgetTitle,
  WidgetBody,
} from "~/features/novel-editor/widgets/containers/WidgetBase"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"
import { Button, HStack } from "@chakra-ui/react"
import { RiCharacterRecognitionFill } from "react-icons/ri"
import { Tooltip } from "~/components/ui/tooltip"
import { TextSelection } from "prosemirror-state"
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap"

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
  { value: "└", name: "ㄴ자 꺾쇠 (답글 기호)" },
  { value: "†", name: "칼표 (십자가)" },
  { value: "“", name: "큰따옴표 열기" },
  { value: "”", name: "큰따옴표 닫기" },
  { value: "‘", name: "작은따옴표 열기" },
  { value: "’", name: "작은따옴표 닫기" },
  { value: "☆", name: "빈 별" },
  { value: "★", name: "찬 별" },
  { value: "♡", name: "빈 하트" },
  { value: "♥", name: "찬 하트" },
]

interface SymbolButtonProps {
  value: string
  label: string
}

const SymbolButton: React.FC<SymbolButtonProps> = ({ value, label }) => {
  const { view } = useEditorContext()

  const onClick = () => {
    if (!view) return
    const { state } = view
    const { from, to } = state.selection

    const tr = state.tr.insertText(value, from, to)
    const pos = from + value.length

    view.dispatch(
      tr.setSelection(TextSelection.create(tr.doc, pos)).scrollIntoView(),
    )
    view.focus()
  }

  return (
    <Tooltip content={label} openDelay={100}>
      <Button variant={"outline"} size="sm" w="28px" onClick={onClick}>
        {value}
      </Button>
    </Tooltip>
  )
}

export const SymbolWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  return (
    <WidgetBase>
      <WidgetHeader {...dragAttributes} {...dragListeners}>
        <RiCharacterRecognitionFill />
        <WidgetTitle>특수문자 입력기</WidgetTitle>
      </WidgetHeader>
      <WidgetBody>
        <HStack flexWrap="wrap" h="80px" overflowY="auto" gap="1">
          {symbols.map((symbol, idx) => (
            <SymbolButton key={idx} value={symbol.value} label={symbol.name} />
          ))}
        </HStack>
      </WidgetBody>
    </WidgetBase>
  )
}
