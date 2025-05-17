import React from "react"
import {
  WidgetBase,
  WidgetHeader,
  WidgetTitle,
  WidgetBody,
} from "~/features/novel-editor/widgets/containers/WidgetBase"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"
import { Button, HStack, Spacer } from "@chakra-ui/react"
import { RiBold, RiItalic, RiUnderline, RiStrikethrough } from "react-icons/ri"
import { Tooltip } from "~/components/ui/tooltip"
import { toggleMark } from "prosemirror-commands"
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap"
import { baseSchema } from "~/features/novel-editor/schema/baseSchema"

const formattingMarks = [
  { mark: "strong", label: "볼드", icon: <RiBold /> },
  { mark: "em", label: "이탤릭", icon: <RiItalic /> },
  { mark: "underline", label: "밑줄", icon: <RiUnderline /> },
  { mark: "strike", label: "취소선", icon: <RiStrikethrough /> },
]

interface FormatButtonProps {
  markType: string
  label: string
  icon: React.ReactElement
}

const FormatButton: React.FC<FormatButtonProps> = ({
  markType,
  label,
  icon,
}) => {
  const { view } = useEditorContext()

  const onClick = () => {
    if (!view || !baseSchema.marks[markType]) return
    toggleMark(baseSchema.marks[markType])(view.state, view.dispatch)
    view.focus()
  }

  return (
    <Tooltip content={label} openDelay={100}>
      <Button size="xs" variant={"ghost"} onClick={onClick}>
        {icon}
      </Button>
    </Tooltip>
  )
}

export const FormattingWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  return (
    <WidgetBase>
      <WidgetHeader>
        <HStack {...dragAttributes} {...dragListeners} flex={1}>
          <WidgetTitle>서식 위젯</WidgetTitle>
        </HStack>
        <HStack gap={0}>
          {formattingMarks.map(({ mark, label, icon }) => (
            <FormatButton
              key={mark}
              markType={mark}
              label={label}
              icon={icon}
            />
          ))}
        </HStack>
      </WidgetHeader>
    </WidgetBase>
  )
}
