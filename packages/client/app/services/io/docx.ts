import { Node as ProseNode, Schema } from "prosemirror-model"
import { pmNodeToHtml } from "~/services/io/html/pmNodeToHtml"
import type { Paragraph, TextRun as TextRunType } from "docx"

/**
 * HTML을 docx Paragraph 배열로 변환 (간단한 <p>, <strong>, <em> 지원)
 */
const htmlToDocxParagraphs = async (html: string): Promise<Paragraph[]> => {
  const [{ Paragraph, TextRun }] = await Promise.all([import("docx")])

  const container = document.createElement("div")
  container.innerHTML = html

  const paragraphs: Paragraph[] = []

  container.querySelectorAll("p").forEach((p) => {
    const runs: TextRunType[] = []
    p.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        runs.push(new TextRun(node.textContent || ""))
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        const text = el.textContent || ""
        const bold = el.tagName === "STRONG" || el.style.fontWeight === "bold"
        const italic = el.tagName === "EM" || el.style.fontStyle === "italic"
        runs.push(new TextRun({ text, bold, italics: italic }))
      }
    })

    paragraphs.push(new Paragraph({ children: runs }))
  })

  return paragraphs
}

/**
 * 주어진 plain text를 docx Blob으로 변환
 * 줄바꿈은 문단(Paragraph)으로 처리
 *
 * @param text - 줄바꿈 포함된 plain text
 * @returns Blob (.docx 파일 형태)
 */
export const textToDocx = async (text: string): Promise<Blob> => {
  const [{ Document, Paragraph, TextRun, Packer }] = await Promise.all([
    import("docx"),
  ])

  const paragraphs = text
    .split("\n")
    .map((line) => new Paragraph({ children: [new TextRun(line || " ")] }))

  const doc = new Document({
    sections: [
      {
        children: paragraphs,
      },
    ],
  })

  return await Packer.toBlob(doc)
}

export const pmNodeToDocx = async (node: ProseNode, schema: Schema) => {
  const [{ Document, Packer }] = await Promise.all([import("docx")])

  const html = pmNodeToHtml(node, schema)
  const paragraphs = await htmlToDocxParagraphs(html)

  const doc = new Document({
    sections: [{ children: paragraphs }],
  })

  return await Packer.toBlob(doc)
}
