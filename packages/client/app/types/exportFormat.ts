export enum ExportFormat {
  Clipboard = "clipboard", // 클라이언트 지원
  PlainText = "plainText", // 클라이언트 지원
  Markdown = "markdown", // 클라이언트 지원 (prosemirror-markdown)
  Html = "html", // 클라이언트 지원 (prosemirror-html)
  Json = "json", // 클라이언트 지원 (Mvle 포맷과 구조 아예 동일)
  Mvle = "mvle", // 클라이언트 지원 (뮤블 포맷)
  MSWord = "msWord",
  Hangul = "hangul",
  PDF = "pdf",
  Epub = "epub",
  LibreOffice = "libreOffice", // 적절한 라이브러리 없음
  RichText = "richText", // 적절한 라이브러리 없음
}
