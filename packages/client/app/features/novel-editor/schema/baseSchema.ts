import { Schema } from "prosemirror-model"
import { EpisodeBlockType } from "muvel-api-types"

export const baseSchema = new Schema({
  nodes: {
    // Inline elements
    doc: {
      content: "block+",
    },

    text: {
      group: "inline",
    },

    hard_break: {
      inline: true,
      group: "inline",
      selectable: false,
      parseDOM: [{ tag: "br" }],
      toDOM: () => ["br"],
    },

    // Block elements
    [EpisodeBlockType.Describe]: {
      group: "block",
      content: "inline*",
      attrs: {
        id: { default: null },
      },
      parseDOM: [
        { tag: "p", getAttrs: (dom) => ({ id: dom.getAttribute("data-id") }) },
      ],
      toDOM: (node) => ["p", { "data-id": node.attrs.id }, 0],
    },

    [EpisodeBlockType.Comment]: {
      group: "block",
      content: "inline*",
      attrs: {
        id: { default: null },
      },
      parseDOM: [
        {
          tag: "aside",
          getAttrs: (dom) => ({
            id: dom.getAttribute("data-id"),
          }),
        },
      ],
      toDOM: (node) => ["aside", { "data-id": node.attrs.id }, 0],
    },

    [EpisodeBlockType.Divider]: {
      group: "block",
      attrs: {
        id: { default: null },
      },
      parseDOM: [
        {
          tag: "hr",
          getAttrs: (dom) => ({ id: dom.getAttribute("data-id") }),
        },
      ],
      toDOM: (node) => ["hr", { "data-id": node.attrs.id }],
    },

    [EpisodeBlockType.Image]: {
      group: "block",
      inline: false,
      attrs: {
        id: { default: null },
        src: {},
        alt: { default: "" },
      },
      parseDOM: [
        {
          tag: "img",
          getAttrs: (dom) => ({
            id: dom.getAttribute("data-id"),
            src: dom.getAttribute("src"),
            alt: dom.getAttribute("alt"),
          }),
        },
      ],
      toDOM: (node) => [
        "img",
        {
          "data-id": node.attrs.id,
          src: node.attrs.src,
          alt: node.attrs.alt,
        },
      ],
    },
  },

  marks: {
    strong: {
      parseDOM: [{ tag: "strong" }, { tag: "b" }],
      toDOM: () => ["strong", 0],
    },
    em: {
      parseDOM: [{ tag: "em" }, { tag: "i" }],
      toDOM: () => ["em", 0],
    },
    underline: {
      parseDOM: [{ tag: "u" }],
      toDOM: () => ["u", 0],
    },
    strike: {
      parseDOM: [{ tag: "s" }, { tag: "del" }],
      toDOM: () => ["s", 0],
    },
  },
})
