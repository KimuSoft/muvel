export const getWidgets = () => {
  const widgetString = localStorage.getItem("widgets")

  let widgets: Set<string> | null = null
  if (!widgetString) {
    return resetWidget()
  }

  try {
    const _widgets = JSON.parse(widgetString) as string[]
    widgets = new Set(_widgets)
  } catch (e: any) {
    console.warn("Error parsing widgets from local storage: " + e.message)
  }
  if (!widgets) widgets = resetWidget()

  return widgets
}

const initialWidget = new Set(["goal"])

const resetWidget = () => {
  localStorage.setItem("widgets", JSON.stringify(Array.from(initialWidget)))
  return initialWidget
}
