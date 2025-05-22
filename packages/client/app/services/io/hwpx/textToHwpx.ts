import JSZip from "jszip"
import {
  VERSION_XML,
  SETTINGS_XML,
  HWPX_MIMETYPE, // HWPX 파일 내 'mimetype' 파일의 내용으로 사용됩니다.
  META_INF_CONTAINER_RDF,
  META_INF_CONTAINER_XML,
  META_INF_MENIFEST_XML, // 제공된 상수명 그대로 사용합니다.
  CONTENTS_HEADER_XML,
  CONTENTS_CONTENT_HPF,
  CONTENTS_SECTION0_XML,
  P_TAG_2,
} from "./constants"
import { generateSection0Xml } from "~/services/io/hwpx/generateSection0Xml" // 이 파일은 사용자가 제공하며, 여기서는 작성하지 않습니다.

// PrvImage.png에 사용될 1x1 투명 PNG 이미지 (base64)
const PRV_IMAGE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

/**
 * Base64 문자열을 Uint8Array로 변환하는 헬퍼 함수입니다.
 * @param base64 Base64 인코딩된 문자열
 * @returns Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = window.atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

/**
 * 주어진 텍스트를 HWPX 파일 형식으로 변환하여 Blob 객체로 반환합니다.
 * @param text HWPX 파일에 포함될 주 텍스트 내용입니다.
 * @returns HWPX 파일 구조를 가진 Blob 객체를 담은 Promise.
 */
export async function textToHwpx(text: string): Promise<Blob> {
  const zip = new JSZip()

  // 1. mimetype 파일 (압축하지 않고 가장 먼저 추가)
  // HWPX_MIMETYPE은 'mimetype' 파일의 내용으로 사용됩니다.
  // 일반적으로 이 파일의 내용은 'application/hwpx+zip' 입니다.
  // 사용자가 제공한 HWPX_MIMETYPE 상수를 그대로 사용합니다.
  zip.file("mimetype", HWPX_MIMETYPE, { compression: "STORE" })

  // 2. 루트 디렉토리 파일들
  zip.file("version.xml", VERSION_XML)
  zip.file("settings.xml", SETTINGS_XML)

  // 3. META-INF 폴더 및 내부 파일들
  const metaInfFolder = zip.folder("META-INF")
  if (metaInfFolder) {
    metaInfFolder.file("container.xml", META_INF_CONTAINER_XML)
    metaInfFolder.file("container.rdf", META_INF_CONTAINER_RDF)
    metaInfFolder.file("manifest.xml", META_INF_MENIFEST_XML) // 제공된 상수명 사용
  }

  // 4. Contents 폴더 및 내부 파일들
  const contentsFolder = zip.folder("Contents")
  if (contentsFolder) {
    contentsFolder.file("header.xml", CONTENTS_HEADER_XML)
    contentsFolder.file("content.hpf", CONTENTS_CONTENT_HPF)

    // section0.xml 내용에서 {MUVEL_TEXT}를 주어진 텍스트로 교체
    // const section0Content = CONTENTS_SECTION0_XML.replace(
    //   "{CONTENT}",
    //   text
    //     .split("\n")
    //     .map((line) => P_TAG_2.replace("{CONTENT}", line.trim()))
    //     .join(),
    // )
    const section0Content = generateSection0Xml(text)
    console.log(section0Content)
    contentsFolder.file("section0.xml", section0Content)
  }

  // 5. Preview 폴더 및 내부 파일들
  const previewFolder = zip.folder("Preview")
  if (previewFolder) {
    // PrvText.txt 파일 (입력 텍스트 그대로 사용)
    previewFolder.file("PrvText.txt", text)

    // PrvImage.png 파일 (샘플 이미지)
    const prvImageBytes = base64ToUint8Array(PRV_IMAGE_BASE64)
    previewFolder.file("PrvImage.png", prvImageBytes)
  }

  // ZIP 파일을 Blob으로 생성
  // 최종 HWPX 파일의 MIME 타입은 'application/hwpx'로 지정합니다.
  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/hwpx", // 생성되는 Blob의 MIME 타입
    compression: "DEFLATE", // 기본 압축 방식
    compressionOptions: {
      level: 9, // 압축 레벨 (1-9)
    },
  })

  return blob
}
