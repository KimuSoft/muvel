import type { EpisodeBlock } from "muvel-api-types"
import { baseSchema } from "~/features/novel-editor/schema/baseSchema"
import { fragmentToBlocks } from "~/features/novel-editor/utils/blockConverter"
import {
  textToPMNodeContent,
  type TextToPMNodeOption,
} from "~/services/io/txt/textToPMNode"

/**
 * Converts a plain text string into an array of EpisodeBlock objects.
 *
 * @param text - The plain text content.
 * @param options - Optional parameters for text-to-ProseMirror node conversion.
 * @returns An array of EpisodeBlock objects.
 */
export function textToBlocks(
  text: string,
  options: TextToPMNodeOption,
): EpisodeBlock[] {
  const docNode = textToPMNodeContent(text, options, baseSchema)

  return fragmentToBlocks(docNode)
}
