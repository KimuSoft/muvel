import {
  Node as ProseMirrorNode,
  DOMSerializer,
  Schema,
} from "prosemirror-model"
import { baseSchema } from "~/features/novel-editor/schema/baseSchema"

export function pmNodeToHtml(
  node: ProseMirrorNode,
  schema: Schema = baseSchema,
): string {
  const serializer = DOMSerializer.fromSchema(schema)
  const document = typeof window !== "undefined" ? window.document : null

  if (!document) {
    throw new Error(
      "DOM document object is not available. This function is intended for browser environments or requires a DOM mock (e.g., jsdom).",
    )
  }

  const fragment = serializer.serializeFragment(node.content, { document })
  const tempDiv = document.createElement("div")
  tempDiv.appendChild(fragment)

  return tempDiv.innerHTML
}
