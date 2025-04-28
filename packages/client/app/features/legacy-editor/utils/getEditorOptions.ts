import { defaultOption, type EditorOption } from "~/providers/OptionProvider"

const getEditorOptions = () => {
  try {
    const storageOption = JSON.parse(
      localStorage.getItem("editor_options") || "{}",
    ) as EditorOption

    const _option: EditorOption = { ...defaultOption, ...storageOption }

    return _option
  } catch (e) {
    return defaultOption
  }
}

export default getEditorOptions
