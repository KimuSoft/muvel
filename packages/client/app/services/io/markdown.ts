// markdown convert (prosemirror-markdown)
import { Node as ProseMirrorNode } from "prosemirror-model"
import {
  MarkdownSerializer,
  MarkdownSerializerState,
} from "prosemirror-markdown"
import { EpisodeBlockType } from "muvel-api-types"

const markdownSerializer = new MarkdownSerializer(
  {
    doc(state: MarkdownSerializerState, node: ProseMirrorNode) {
      state.renderContent(node)
    },
    [EpisodeBlockType.Describe](
      state: MarkdownSerializerState,
      node: ProseMirrorNode,
    ) {
      state.renderInline(node)
      state.closeBlock(node)
    },
    text(state: MarkdownSerializerState, node: ProseMirrorNode) {
      if (node.text) {
        state.text(node.text, true)
      }
    },
    hard_break(state: MarkdownSerializerState) {
      state.write("  \n")
    },
  },
  {
    em: {
      open: "_",
      close: "_",
      mixable: true,
      expelEnclosingWhitespace: true,
    },
    strong: {
      open: "**",
      close: "**",
      mixable: true,
      expelEnclosingWhitespace: true,
    },
    strikethrough: {
      open: "~~",
      close: "~~",
      mixable: true,
      expelEnclosingWhitespace: true,
    },
  },
)

export function pmNodeToMarkdown(node: ProseMirrorNode): string {
  return markdownSerializer.serialize(node)
}
