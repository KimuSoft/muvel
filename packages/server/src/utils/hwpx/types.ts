// types.ts

// fast-xml-parser의 XMLBuilder가 XML 문자열로 변환할 수 있는 JavaScript 객체 타입입니다.
// XMLBuilder({ignoreAttributes: false}).build(obj) 형태로 사용 가능한 객체여야 합니다.
export type FxpXmlObject = any

// HWPX 파일의 META-INF 폴더 내용을 위한 옵션 인터페이스
export interface HwpxMetaInfOptions {
  containerXml: string | FxpXmlObject
  manifestXml: string | FxpXmlObject
  containerRdf?: string | FxpXmlObject // 선택 사항
}

// HWPX 파일의 Contents 폴더 내용을 위한 옵션 인터페이스
export interface HwpxContentsOptions {
  contentHpf: string | FxpXmlObject
  headerXml: string | FxpXmlObject
  /**
   * 섹션(본문) 내용 배열. 각 항목은 순서대로 Contents/section0.xml, Contents/section1.xml 등으로 저장됩니다.
   */
  sections: Array<string | FxpXmlObject>
}

// HWPX 파일의 Preview 폴더 내용을 위한 옵션 인터페이스
export interface HwpxPreviewOptions {
  prvText?: string
  prvImage?: Buffer // 이미지는 Buffer 형태로 전달
}

// HWPX 파일의 BinData 폴더 내용을 위한 옵션 인터페이스
export interface HwpxBinDataOptions {
  /**
   * 바이너리 데이터의 파일 이름과 Buffer 내용. 'BinData/' 디렉터리 하위에 저장됩니다.
   * 예: { 'image1.png': Buffer객체 }
   */
  [fileName: string]: Buffer
}

// HWPX 파일 전체 구성을 위한 옵션 인터페이스
export interface HwpxFileOptions {
  /**
   * HWPX 파일의 MIME 타입 문자열. (예: 'application/hwp+zip')
   */
  mimetype: string
  versionXml: string | FxpXmlObject
  settingsXml: string | FxpXmlObject
  metaInf: HwpxMetaInfOptions
  contents: HwpxContentsOptions
  preview?: HwpxPreviewOptions
  binData?: HwpxBinDataOptions
}
