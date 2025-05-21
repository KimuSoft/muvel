import { Box, type BoxProps, VStack } from "@chakra-ui/react"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import React from "react"

export const WidgetZone = ({
  side,
  children,
  widgetIds,
  ...props
}: {
  side: "left" | "right"
  children: React.ReactNode
  widgetIds: string[]
} & BoxProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: side })

  return (
    <Box
      ref={setNodeRef}
      bgColor={
        isOver ? { base: "blackAlpha.300", _dark: "whiteAlpha.300" } : undefined
      }
      transition={"background-color 0.2s"}
      h={"100%"}
      {...props}
    >
      <SortableContext items={widgetIds} strategy={verticalListSortingStrategy}>
        <VStack
          w={"100%"}
          h={"100%"}
          flexDir={"column-reverse"}
          gap={2}
          p={2}
          overflowY={"scroll"}
          // 스크롤 숨기기
          css={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
            scrollbarWidth: "none", // Firefox
          }}
        >
          {children}
        </VStack>
      </SortableContext>
    </Box>
  )
}
