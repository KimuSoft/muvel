import { EmptyState, VStack } from "@chakra-ui/react"
import { FaEllipsis } from "react-icons/fa6"
import React from "react"

const NovelEmptyState: React.FC = () => {
  return (
    <EmptyState.Root>
      <EmptyState.Content>
        <EmptyState.Indicator>
          <FaEllipsis />
        </EmptyState.Indicator>
        <VStack textAlign="center">
          <EmptyState.Title>소설이 없는데요...?</EmptyState.Title>
          <EmptyState.Description>
            새 소설 쓰기 버튼으로 새 이야기를 펼쳐 보아요!
          </EmptyState.Description>
        </VStack>
      </EmptyState.Content>
    </EmptyState.Root>
  )
}

export default NovelEmptyState
