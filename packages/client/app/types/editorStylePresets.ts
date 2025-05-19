import type { EditorStyleOptions } from "~/types/options"

type EditorStyleOptionPreset = Partial<EditorStyleOptions>

// 기본 옵션
export const muvelDesktopPreset: Omit<
  EditorStyleOptions,
  "typewriter" | "typewriterStrict"
> = {
  lineHeight: 1.8,
  fontSize: 18,
  indent: 0,
  fontWeight: 400,
  fontFamily: '"Pretendard Variable"',
  color: null,
  blockGap: 2,
  backgroundColor: null,
  editorMaxWidth: 600,
}

export const muvelMobilePreset: EditorStyleOptionPreset = {
  lineHeight: 1.8,
  fontSize: 18,
  indent: 0,
  fontWeight: 400,
  fontFamily: `"Pretendard Variable"`,
  color: null,
  blockGap: 7,
  backgroundColor: null,
  editorMaxWidth: 460,
}

export const moonpiaDesktopPreset: EditorStyleOptionPreset = {
  lineHeight: 2,
  fontSize: 18,
  indent: 1,
  fontWeight: 400,
  fontFamily: `바탕, 바탕체`,
  color: "#000",
  blockGap: 15,
  backgroundColor: "#e3efee",
  editorMaxWidth: 570,
}

export const novelpiaDesktopPreset: EditorStyleOptionPreset = {
  lineHeight: 1.8,
  fontSize: 18,
  indent: 0,
  fontWeight: 400,
  fontFamily: '"Noto Sans KR", "Pretendard Variable", Inter, sans-serif',
  color: null,
  blockGap: 15,
  backgroundColor: null,
  editorMaxWidth: 930,
}

export const novelpiaMobilePreset: EditorStyleOptionPreset = {
  lineHeight: 2,
  fontSize: 18,
  indent: 0,
  fontWeight: 400,
  fontFamily: '"Noto Sans KR", "Pretendard Variable", Inter, sans-serif',
  color: null,
  blockGap: 15,
  backgroundColor: null,
  editorMaxWidth: 460,
}

export const kakaopagePreset: EditorStyleOptionPreset = {
  lineHeight: 2,
  fontSize: 18,
  indent: 0,
  fontWeight: 100,
  fontFamily: "KoPubWorldBatang",
  color: null,
  blockGap: 15,
  backgroundColor: null,
  editorMaxWidth: 400,
}

export const joaraPreset: EditorStyleOptionPreset = {
  lineHeight: 2,
  fontSize: 16,
  indent: 0,
  fontWeight: 400,
  fontFamily: `"Pretendard Variable"`,
  color: "#343434",
  blockGap: 15,
  backgroundColor: "#c3dda8",
  editorMaxWidth: 930,
}
