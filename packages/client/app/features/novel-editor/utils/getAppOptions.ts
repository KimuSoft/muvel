import { LOCAL_APP_SETTING_STORAGE_KEY } from "~/providers/AppOptionProvider"
import type { AppOptions } from "~/types/options"

export const getAppOptions = (): AppOptions | null => {
  const optionStr = localStorage.getItem(LOCAL_APP_SETTING_STORAGE_KEY)
  if (!optionStr) return null

  const options = JSON.parse(optionStr) as AppOptions | null
  return options || null
}
