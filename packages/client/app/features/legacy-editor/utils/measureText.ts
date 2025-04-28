import { type Node as PMNode } from "prosemirror-model"

export enum CountType {
  All,
  NoSpacing,
  KB,
}

export const countTextLength = (doc: PMNode, type: CountType): number => {
  const text = doc.textContent ?? ""

  switch (type) {
    case CountType.NoSpacing:
      return text.replace(/[\s\.,!\?]/g, "").length
    case CountType.All:
      return text.length
    case CountType.KB:
      let totalByte = 0
      for (let i = 0; i < text.length; i++) {
        const currentByte = text.charCodeAt(i)
        totalByte += currentByte > 128 ? 2 : 1
      }
      return Math.floor((totalByte / 1024) * 100 * 1.439) / 100
  }
}
