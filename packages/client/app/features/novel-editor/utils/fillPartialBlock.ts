import type { BaseBlock, MuvelBlockType, PartialBlock } from "muvel-api-types"

// PartialBlock을 Block으로 변환하는 함수 (text와 updatedAt을 넣어줌)
export const fillPartialBlock = <BType = MuvelBlockType>(
  partialBlock: PartialBlock<BType>,
): BaseBlock<BType> => {
  return {
    ...partialBlock,
    text: partialBlock.content.map((node) => node.text).join(""),
    updatedAt: new Date().toISOString(),
  }
}

export const fillPartialBlocks = <BType = MuvelBlockType>(
  partialBlocks: PartialBlock<BType>[],
): BaseBlock<BType>[] => {
  return partialBlocks.map((partialBlock) => fillPartialBlock(partialBlock))
}
