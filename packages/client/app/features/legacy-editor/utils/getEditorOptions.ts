import {
  defaultOption,
  type EditorStyleOption,
} from "~/providers/OptionProvider"

const getEditorOptions = () => {
  try {
    const storageOption = JSON.parse(
      localStorage.getItem("editor_options") || "{}",
    ) as EditorStyleOption

    const _option: EditorStyleOption = { ...defaultOption, ...storageOption }

    return _option
  } catch (e) {
    return defaultOption
  }
}

export default getEditorOptions
