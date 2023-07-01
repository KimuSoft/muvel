export default () => {
  try {
    const storageOption = JSON.parse(
      localStorage["editorOption"]
    ) as EditorOption

    const _option: EditorOption = { ...defaultOption }
    if (storageOption.fontSize) _option.fontSize = storageOption.fontSize
    if (storageOption.lineHeight) _option.lineHeight = storageOption.lineHeight

    return _option
  } catch (e) {
    return defaultOption
  }
}

export const defaultOption: EditorOption = {
  lineHeight: 34,
  fontSize: 19,
}

export interface EditorOption {
  lineHeight: number
  fontSize: number
}
