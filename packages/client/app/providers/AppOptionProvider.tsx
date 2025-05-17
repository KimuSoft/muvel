import React, {
  createContext,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { type Draft, produce } from "immer"
import { type AppOptions } from "~/types/options"
import {
  defaultAppExportOptions,
  defaultAppOptions,
  defaultEditorStyleOptions,
  defaultViewOptions,
  defaultWidgetSettings,
} from "~/types/defaultOptions"

const IS_CLIENT = typeof window !== "undefined"

export const OptionContext = createContext<AppOptions>(defaultAppOptions)
export const SetOptionContext = createContext<
  ((updater: (draft: Draft<AppOptions>) => void) => void) | null
>(null)

export const LOCAL_APP_SETTING_STORAGE_KEY = "muvelAppSettings"

const getAppOptionsFromStorage = (): AppOptions => {
  if (!IS_CLIENT) {
    return defaultAppOptions
  }

  try {
    const storageOption = localStorage.getItem(LOCAL_APP_SETTING_STORAGE_KEY)
    if (storageOption) {
      const parsedOptions = JSON.parse(storageOption) as Partial<AppOptions>
      // 각 최상위 속성별로 기본값과 병합하여 반환
      return {
        editorStyle: {
          ...defaultEditorStyleOptions,
          ...parsedOptions.editorStyle,
        },
        exportSettings: {
          ...defaultAppExportOptions,
          ...parsedOptions.exportSettings,
        },
        viewOptions: {
          ...defaultViewOptions,
          ...parsedOptions.viewOptions,
          // viewOptions 내부의 widgetLayout도 안전하게 병합
          widgetLayout: {
            ...defaultViewOptions.widgetLayout,
            ...parsedOptions.viewOptions?.widgetLayout,
          },
        },
        widgetSettings: {
          ...defaultWidgetSettings,
          ...parsedOptions.widgetSettings,
        },
      }
    }
  } catch (error) {
    console.error("Failed to load app options from localStorage:", error)
  }
  return defaultAppOptions
}

export const AppOptionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [options, _setOptions] = useState<AppOptions>(getAppOptionsFromStorage)

  useEffect(() => {
    if (!IS_CLIENT) return
    localStorage.setItem(LOCAL_APP_SETTING_STORAGE_KEY, JSON.stringify(options))
  }, [options])

  const setAllAppOptions = useCallback(
    (updater: (draft: Draft<AppOptions>) => void) => {
      _setOptions((prev) => produce(prev, updater))
    },
    [],
  )

  return (
    <OptionContext.Provider value={options}>
      <SetOptionContext.Provider value={setAllAppOptions}>
        {children}
      </SetOptionContext.Provider>
    </OptionContext.Provider>
  )
}

export default AppOptionProvider
