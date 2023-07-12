import { defaultOption, EditorOption } from "../types"

const initEditorOption = () => {
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

export default initEditorOption
