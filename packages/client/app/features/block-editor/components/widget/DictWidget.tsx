import React from "react"
import { Widget, WidgetBody, WidgetHeader } from "./Widget"
import { Input, Text } from "@chakra-ui/react"
import { AiOutlineBook } from "react-icons/ai"

const DictWidget: React.FC = () => {
  return (
    <Widget>
      <WidgetHeader>
        <AiOutlineBook />
        <Text>빠른 사전 위젯</Text>
      </WidgetHeader>
      <WidgetBody>
        <Input />
      </WidgetBody>
    </Widget>
  )
}

export default DictWidget
