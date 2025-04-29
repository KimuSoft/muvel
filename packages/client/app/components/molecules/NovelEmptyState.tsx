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
            Explore our products and add items to your cart
          </EmptyState.Description>
        </VStack>
      </EmptyState.Content>
    </EmptyState.Root>
  )
}

export default NovelEmptyState
