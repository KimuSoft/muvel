import React from "react"
import { Skeleton } from "@chakra-ui/react"

const NovelItemSkeleton: React.FC = () => {
  return <Skeleton rounded={5} w={"100%"} h={"160px"} minW={"350px"}></Skeleton>
}

export default NovelItemSkeleton
