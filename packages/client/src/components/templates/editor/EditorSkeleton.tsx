import { Container, Skeleton, VStack } from "@chakra-ui/react"
import React from "react"

const EditorSkeleton: React.FC = () => {
  return (
    <Container maxW="3xl">
      <VStack gap={10} align={"baseline"}>
        <Skeleton height="20px" width="100%" />
        <Skeleton height="20px" width="80%" />
        <Skeleton height="20px" width="60%" />
        <Skeleton height="20px" width="100%" />
        <Skeleton height="20px" width="60%" />
        <Skeleton height="20px" width="100%" />
        <Skeleton height="22px" width="90%" />
        <Skeleton height="20px" width="100%" />
        <Skeleton height="20px" width="80%" />
        <Skeleton height="20px" width="40%" />
        <Skeleton height="20px" width="100%" />
        <Skeleton height="20px" width="60%" />
        <Skeleton height="20px" width="30%" />
        <Skeleton height="20px" width="60%" />
      </VStack>
    </Container>
  )
}

export default EditorSkeleton
