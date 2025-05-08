import type { EditorOption } from "~/providers/OptionProvider"

type EditorOptionPreset = Partial<EditorOption>

export const muvelMobilePreset: EditorOptionPreset = {
  lineHeight: 1.8,
  fontSize: 18,
  indent: 1,
  fontWeight: 400,
  fontFamily: `"Pretendard Variable"`,
  color: null,
  blockGap: 7,
  backgroundColor: null,
  editorMaxWidth: 460,
}

export const novelpiaDesktopPreset: EditorOptionPreset = {
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

export const novelpiaMobilePreset: EditorOptionPreset = {
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

export const kakaopagePreset: EditorOptionPreset = {
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

export const joaraPreset: EditorOptionPreset = {
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
