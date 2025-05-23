export enum EpisodeBlockType {
  Describe = "describe",
  Quote = "quote",
  Comment = "comment",
  Divider = "divider",
  Image = "image",
}

export enum WikiBlockType {
  Paragraph = "paragraph",
  Heading1 = "h1",
  Heading2 = "h2",
  Heading3 = "h3",
  BulletList = "bullet_list",
  OrderedList = "ordered_list",
  ListItem = "list_item",
  Blockquote = "blockquote",
  Callout = "callout",
}

/** @deprecated 명확성 때문에 EpisodeBlockType 사용을 권장함 */
export enum BlockType {
  Describe = "describe",
  Quote = "quote",
  Comment = "comment",
  Divider = "divider",
  Image = "image",
}

export type MuvelBlockType = EpisodeBlockType | WikiBlockType
