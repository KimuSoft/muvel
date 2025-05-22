export function generateSection0Xml(text: string): string {
  // 줄바꿈 기준으로 분리
  const lines = text.split(/\r?\n/)

  // 각 줄을 <hp:p> 요소로 변환
  const paragraphs = lines
    .map(
      (line) => `
    <hp:p paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
      <hp:run charPrIDRef="0">
        <hp:t>${escapeXml(line)}</hp:t>
      </hp:run>
    </hp:p>
  `,
    )
    .join("\n")

  // 전체 section0.xml 구조
  const sectionXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hs:sec xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph"
        xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section">
${paragraphs}
</hs:sec>`

  return sectionXml
}

// XML 특수 문자 이스케이프 처리
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case "&":
        return "&amp;"
      case "'":
        return "&apos;"
      case '"':
        return "&quot;"
      default:
        return char
    }
  })
}
