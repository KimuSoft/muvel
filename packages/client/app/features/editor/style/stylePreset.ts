import type { EditorOption } from "~/providers/OptionProvider"

export const muvelMobilePreset: EditorOption = {
  lineHeight: 1.8,
  fontSize: 18,
  indent: 1,
  fontWeight: 400,
  fontFamily: "Inter",
  color: null,
  blockGap: 7,
  backgroundColor: null,
  editorMaxWidth: 460,
}

export const novelpiaDesktopPreset: EditorOption = {
  lineHeight: 1.8,
  fontSize: 18,
  indent: 0,
  fontWeight: 400,
  fontFamily: "Noto Sans KR, Pretendard, Inter, sans-serif",
  color: "#000000",
  blockGap: 15,
  backgroundColor: "#ffffff",
  editorMaxWidth: 930,
}

export const novelpiaMobilePreset: EditorOption = {
  lineHeight: 2,
  fontSize: 18,
  indent: 1,
  fontWeight: 400,
  fontFamily: "Noto Sans KR, Pretendard, Inter, sans-serif",
  color: "#000000",
  blockGap: 15,
  backgroundColor: "#ffffff",
  editorMaxWidth: 460,
}

export const kakaopagePreset: EditorOption = {
  lineHeight: 2,
  fontSize: 18,
  indent: 1,
  fontWeight: 100,
  fontFamily: "KoPubWorldBatang",
  color: "#000000",
  blockGap: 15,
  backgroundColor: "#ffffff",
  editorMaxWidth: 400,
}

export const joaraPreset: EditorOption = {
  lineHeight: 2,
  fontSize: 16,
  indent: 1,
  fontWeight: 400,
  fontFamily: "sans-serif",
  color: "#343434",
  blockGap: 15,
  backgroundColor: "#c3dda8",
  editorMaxWidth: 930,
}
