// createHwpxUtils.ts
import { promises as fs } from "fs"
import JSZip from "jszip"
import { XMLBuilder } from "fast-xml-parser"
import { FxpXmlObject, HwpxFileOptions } from "./types" // 분리된 타입 파일 임포트

// fast-xml-parser의 XMLBuilder 인스턴스 설정
const xmlBuilder = new XMLBuilder({
  format: false, // 파일 크기를 위해 예쁘게 포맷하지 않음
  ignoreAttributes: false, // 속성 처리
  suppressEmptyNode: true, // 빈 노드는 self-closing 태그로 (예: <tag/>)
})

/**
 * XML 문자열 또는 FxpXmlObject를 받아 XML 문자열로 반환합니다.
 * @param content XML 문자열 또는 FxpXmlObject
 * @returns XML 문자열
 */
function getContentAsString(content: string | FxpXmlObject): string {
  if (typeof content === "string") {
    return content
  }
  // FxpXmlObject인 경우 XML 문자열로 빌드합니다.
  // XML 선언문(<?xml ...?>)은 FxpXmlObject 자체에 포함되거나, 필요시 별도 처리해야 합니다.
  return xmlBuilder.build(content)
}

/**
 * 제공된 옵션을 사용하여 HWPX 파일을 생성합니다. (JSZip 사용)
 *
 * @param outputPath 생성될 HWPX 파일의 전체 경로 (예: 'mydocument.hwpx')
 * @param options HWPX 파일 각 부분의 내용을 담은 구조화된 옵션 객체
 * @returns 파일 생성이 완료되면 resolve되는 Promise
 * @throws 'mimetype'이 없거나 파일 작업 실패 시 오류 발생
 */
export async function createHwpxWithJSZip(
  outputPath: string,
  options: HwpxFileOptions,
): Promise<void> {
  if (!options || typeof options !== "object") {
    throw new Error("HWPX 파일 옵션 객체가 필요합니다.")
  }
  if (typeof options.mimetype !== "string" || options.mimetype.trim() === "") {
    throw new Error(
      "options.mimetype (문자열)은 필수이며 비어 있을 수 없습니다.",
    )
  }

  const zip = new JSZip()

  // 1. mimetype 파일을 가장 먼저, 압축하지 않고 추가 (HWPX/OCF 규격)
  zip.file("mimetype", options.mimetype, { compression: "STORE" })

  // 2. 루트 파일 추가
  zip.file("version.xml", getContentAsString(options.versionXml))
  zip.file("settings.xml", getContentAsString(options.settingsXml))

  // 3. META-INF 폴더 파일 추가
  const metaInfDir = "META-INF/"
  zip.file(
    metaInfDir + "container.xml",
    getContentAsString(options.metaInf.containerXml),
  )
  zip.file(
    metaInfDir + "manifest.xml",
    getContentAsString(options.metaInf.manifestXml),
  )
  if (options.metaInf.containerRdf) {
    zip.file(
      metaInfDir + "container.rdf",
      getContentAsString(options.metaInf.containerRdf),
    )
  }

  // 4. Contents 폴더 파일 추가
  const contentsDir = "Contents/"
  zip.file(
    contentsDir + "content.hpf",
    getContentAsString(options.contents.contentHpf),
  )
  zip.file(
    contentsDir + "header.xml",
    getContentAsString(options.contents.headerXml),
  )
  options.contents.sections.forEach((sectionContent, index) => {
    zip.file(
      `${contentsDir}section${index}.xml`,
      getContentAsString(sectionContent),
    )
  })

  // 5. Preview 폴더 파일 추가 (제공된 경우)
  if (options.preview) {
    const previewDir = "Preview/"
    if (options.preview.prvText) {
      zip.file(previewDir + "PrvText.txt", options.preview.prvText)
    }
    if (options.preview.prvImage) {
      zip.file(previewDir + "PrvImage.png", options.preview.prvImage, {
        binary: true,
      })
    }
  }

  // 6. BinData 폴더 파일 추가 (제공된 경우)
  if (options.binData) {
    const binDataDir = "BinData/"
    for (const fileName in options.binData) {
      if (options.binData.hasOwnProperty(fileName)) {
        zip.file(binDataDir + fileName, options.binData[fileName], {
          binary: true,
        })
      }
    }
  }

  try {
    // 7. ZIP 파일 생성 (Node.js 버퍼 형태)
    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE", // 다른 파일들에 대한 기본 압축 방식
      compressionOptions: {
        level: 9, // 기본 압축 레벨
      },
      platform: process.platform === "win32" ? "DOS" : "UNIX", // 플랫폼 호환성
    })

    // 8. 생성된 버퍼를 파일로 저장
    await fs.writeFile(outputPath, zipBuffer)
    console.log(`HWPX 파일이 성공적으로 생성되었습니다: ${outputPath}`)
  } catch (error) {
    console.error("JSZip으로 HWPX 파일 생성 중 오류 발생:", error)
    throw error
  }
}
