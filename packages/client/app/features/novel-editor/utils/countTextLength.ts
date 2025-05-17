import type { CharCountWidgetOptions } from "~/features/novel-editor/components/dialogs/CharCountSettingDialog"

/**
 * 텍스트 길이 계산 단위 Enum
 */
export enum CountUnit {
  Char = 0, // 글자 수(자)
  Word = 1, // 단어 수(단어)
  Sentence = 2, // 문장 수(문장)
  KB = 3, // 용량 표기(KB)
}

/**
 * 텍스트 길이 계산 옵션 인터페이스
 */
export type CountOptions = Omit<
  CharCountWidgetOptions,
  "showConfetti" | "targetGoal"
>

/**
 * 문자열의 UTF-8 바이트 수를 계산합니다.
 * @param str - 바이트 수를 계산할 문자열
 * @returns UTF-8 바이트 수
 */
const getUTF8Bytes = (str: string): number => {
  // TextEncoder는 기본적으로 UTF-8을 사용합니다.
  const encoder = new TextEncoder()
  return encoder.encode(str).length
}

/**
 * 주어진 문자열과 옵션에 따라 텍스트 길이를 계산합니다.
 *
 * @param content - 길이를 계산할 원본 문자열
 * @param options - 계산 방식을 정의하는 CountOptions 객체
 * @returns 계산된 길이 (단위에 따라 정수 또는 소수)
 */
export const countTextLength = (
  content: string,
  options: CountOptions,
): number => {
  if (!content) return 0 // 내용이 없으면 0 반환

  console.log("계산 수행됨")

  const { unit, excludeSpaces, excludeSpecialChars } = options

  // Char 또는 KB 단위일 때만 필터링 적용
  if (unit === CountUnit.Char || unit === CountUnit.KB) {
    let filteredContent = content

    // 1. 공백 제외 옵션 적용
    if (excludeSpaces) {
      // 모든 종류의 공백 문자(스페이스, 탭, 줄바꿈 등) 제거
      filteredContent = filteredContent.replace(/\s+/g, "")
    }

    // 2. 특수문자 제외 옵션 적용
    if (excludeSpecialChars) {
      // 유니코드 속성을 사용하여 문자(L), 숫자(N), 공백(s)을 제외한 모든 문자 제거
      // \p{L}: 모든 언어의 글자
      // \p{N}: 모든 종류의 숫자
      // \s: 모든 공백 문자
      // ^: 부정 (not)
      // u 플래그: 유니코드 속성 사용
      // g 플래그: 전역 검색
      filteredContent = filteredContent.replace(/[^\p{L}\p{N}\s]/gu, "")
    }

    // 3. 문장부호 제외 옵션 적용
    if (options.excludePunctuations) {
      // 문장부호를 제외한 모든 문자 제거
      // \p{P}: 모든 문장부호
      filteredContent = filteredContent.replace(/\p{P}/gu, "")
    }

    // 3. 단위별 계산
    if (unit === CountUnit.Char) {
      // 필터링된 내용의 글자 수 반환
      return filteredContent.length
    } else {
      // unit === CountUnit.KB
      // 필터링된 내용의 UTF-8 바이트 수를 KB로 변환하여 반환
      const bytes = getUTF8Bytes(filteredContent)
      // 소수점 2자리까지 반올림
      return parseFloat((bytes / 1024).toFixed(2))
    }
  }

  // Word 또는 Sentence 단위일 경우 원본 텍스트 사용 (필터링 미적용)
  if (unit === CountUnit.Word) {
    // 앞뒤 공백 제거 후 공백 기준으로 단어 분리, 빈 요소 제거 후 개수 반환
    const words = content.trim().split(/\s+/).filter(Boolean) // filter(Boolean)은 빈 문자열 제거
    return words.length
  }

  if (unit === CountUnit.Sentence) {
    // 앞뒤 공백 제거
    const trimmedContent = content.trim()
    if (!trimmedContent) return 0 // 내용 없으면 0

    // 문장 종결 부호(.!?) 뒤에 공백이 오거나 문자열 끝인 경우를 기준으로 분리
    // 주의: 약어(Mr. 등)나 복합적인 문장 구조는 정확히 처리하지 못할 수 있음
    const sentences = trimmedContent.split(/[.!?]+\s*/).filter(Boolean)
    return sentences.length
  }

  // 정의되지 않은 단위의 경우 0 반환
  return 0
}
