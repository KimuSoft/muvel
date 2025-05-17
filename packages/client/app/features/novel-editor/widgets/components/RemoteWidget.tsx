import React from "react"
import {
  WidgetBase,
  WidgetBody,
  WidgetHeader,
  WidgetTitle,
} from "~/features/novel-editor/widgets/containers/WidgetBase"
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap"
import { Button, Group, HStack } from "@chakra-ui/react"
import { MdSettingsRemote } from "react-icons/md"
import { TbChevronLeft, TbChevronRight } from "react-icons/tb"

export const RemoteWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  return (
    <WidgetBase>
      <WidgetHeader>
        <HStack w="100%" {...dragAttributes} {...dragListeners}>
          <MdSettingsRemote />
          <WidgetTitle>리모콘 위젯</WidgetTitle>
        </HStack>
      </WidgetHeader>
      <WidgetBody
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Group attached>
          <Button size={"sm"} variant={"ghost"}>
            <TbChevronLeft />
            이전 편
          </Button>
          <Button
            w={"90px"}
            size={"sm"}
            colorPalette={"purple"}
            variant={"ghost"}
          >
            10편
          </Button>
          <Button size={"sm"} variant={"ghost"}>
            다음 편
            <TbChevronRight />
          </Button>
        </Group>
      </WidgetBody>
    </WidgetBase>
  )
}
