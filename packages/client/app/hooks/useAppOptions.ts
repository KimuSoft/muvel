import { useCallback, useContext } from "react"
import { type Draft } from "immer"
import { OptionContext, SetOptionContext } from "~/providers/AppOptionProvider"
import type {
  AppExportOptions,
  EditorStyleOptions,
  ViewOptions,
  WidgetInstanceId,
  WidgetLayout,
  WidgetSettings,
} from "~/types/options"
import type { WidgetId } from "~/features/novel-editor/widgets/components/widgetMap"
import {
  defaultAppExportOptions,
  defaultEditorStyleOptions,
  defaultViewOptions,
  defaultWidgetSettings,
} from "~/types/defaultOptions"

export const useAppOptionsContext = () => {
  const options = useContext(OptionContext)
  // SetOptionContext의 updater 타입이 (draft: Draft<AppOptions>) => void | AppOptions 임을 가정
  const setOptions = useContext(SetOptionContext)

  if (!options || !setOptions) {
    throw new Error(
      "useAppOptionsContext must be used within an AppOptionProvider",
    )
  }
  return [options, setOptions] as const
}

export const useEditorStyleOptions = () => {
  const [allOptions, setAllOptions] = useAppOptionsContext()

  const setEditorStyle = useCallback(
    (
      updater: (draft: Draft<EditorStyleOptions>) => void | EditorStyleOptions,
    ) => {
      setAllOptions((draftAll) => {
        const result = updater(draftAll.editorStyle)
        if (result !== undefined) {
          // void가 아닌 새로운 객체가 반환되었는지 확인
          draftAll.editorStyle = result
        }
        // void를 반환하면 draftAll.editorStyle의 변경사항이 적용됨 (immer 기본 동작)
      })
    },
    [setAllOptions],
  )

  const resetEditorStyle = useCallback(() => {
    setEditorStyle(() => defaultEditorStyleOptions)
  }, [setEditorStyle])

  return [allOptions.editorStyle, setEditorStyle, resetEditorStyle] as const
}

export const useExportSettingOptions = () => {
  const [allOptions, setAllOptions] = useAppOptionsContext()

  const setExportSettings = useCallback(
    (updater: (draft: Draft<AppExportOptions>) => void | AppExportOptions) => {
      setAllOptions((draftAll) => {
        const result = updater(draftAll.exportSettings)
        if (result !== undefined) {
          draftAll.exportSettings = result
        }
      })
    },
    [setAllOptions],
  )

  const resetExportSettings = useCallback(() => {
    setExportSettings(() => defaultAppExportOptions)
  }, [setExportSettings])

  return [
    allOptions.exportSettings,
    setExportSettings,
    resetExportSettings,
  ] as const
}

export const useViewOptions = () => {
  const [allOptions, setAllOptions] = useAppOptionsContext()

  const setViewOptions = useCallback(
    (updater: (draft: Draft<ViewOptions>) => void | ViewOptions) => {
      setAllOptions((draftAll) => {
        const result = updater(draftAll.viewOptions)
        if (result !== undefined) {
          draftAll.viewOptions = result
        }
      })
    },
    [setAllOptions],
  )

  const resetViewOptions = useCallback(() => {
    setViewOptions(() => defaultViewOptions)
  }, [setViewOptions])

  return [allOptions.viewOptions, setViewOptions, resetViewOptions] as const
}

export const useWidgetSettingsContext = () => {
  // 전체 위젯 설정을 다루는 컨텍스트 훅
  const [allOptions, setAllOptions] = useAppOptionsContext()

  const setAllWidgetSettings = useCallback(
    (updater: (draft: Draft<WidgetSettings>) => void | WidgetSettings) => {
      setAllOptions((draftAll) => {
        const result = updater(draftAll.widgetSettings)
        if (result !== undefined) {
          draftAll.widgetSettings = result
        }
      })
    },
    [setAllOptions],
  )

  const resetAllWidgetSettings = useCallback(() => {
    setAllWidgetSettings(() => defaultWidgetSettings)
  }, [setAllWidgetSettings])

  return [
    allOptions.widgetSettings,
    setAllWidgetSettings,
    resetAllWidgetSettings,
  ] as const
}

export const useSpecificWidgetSettings = <T extends Record<string, any>>(
  widgetInstanceId: WidgetInstanceId,
  defaultOptions?: T, // 이 위젯 타입의 기본값
) => {
  const [allWidgetSettings, setAllWidgetSettings, _resetAllWidgetSettings] =
    useWidgetSettingsContext()

  const setSettings = useCallback(
    (updater: (draft: Draft<T>) => void | T) => {
      setAllWidgetSettings((draftAllSettings) => {
        if (!draftAllSettings[widgetInstanceId] && defaultOptions) {
          draftAllSettings[widgetInstanceId] = { ...defaultOptions }
        }
        const result = updater(draftAllSettings[widgetInstanceId] as Draft<T>)
        if (result !== undefined) {
          draftAllSettings[widgetInstanceId] = result
        }
      })
    },
    [setAllWidgetSettings, widgetInstanceId, defaultOptions],
  )

  const resetSettings = useCallback(() => {
    // 이 위젯 인스턴스의 설정만 기본값(defaultOptions)으로 리셋
    setAllWidgetSettings((draftAllSettings) => {
      if (defaultOptions) {
        draftAllSettings[widgetInstanceId] = { ...defaultOptions }
      } else {
        // defaultOptions가 없으면 해당 위젯 설정을 삭제할 수도 있음
        delete draftAllSettings[widgetInstanceId]
      }
    })
  }, [setAllWidgetSettings, widgetInstanceId, defaultOptions])

  const currentSettings = allWidgetSettings[widgetInstanceId]
    ? ({ ...defaultOptions, ...allWidgetSettings[widgetInstanceId] } as T)
    : ({ ...defaultOptions } as T)

  return [currentSettings, setSettings, resetSettings] as const
}

export const useWidgetLayout = () => {
  const [currentViewOptions, setCurrentViewOptions, _resetViewOptions] =
    useViewOptions()

  const setWidgetLayout = useCallback(
    (updater: (draft: Draft<WidgetLayout>) => void | WidgetLayout) => {
      setCurrentViewOptions((draftViewOptions) => {
        const result = updater(draftViewOptions.widgetLayout)
        if (result !== undefined) {
          draftViewOptions.widgetLayout = result
        }
      })
    },
    [setCurrentViewOptions],
  )

  const resetWidgetLayout = useCallback(() => {
    // defaultViewOptions에서 widgetLayout 부분만 가져와서 리셋
    setWidgetLayout(() => defaultViewOptions.widgetLayout)
  }, [setWidgetLayout])

  const toggleWidget = useCallback(
    (widgetId: WidgetId) => {
      setCurrentViewOptions((draftViewOptions) => {
        const { left, right } = draftViewOptions.widgetLayout
        const id = widgetId
        const inLeft = left.includes(id)
        const inRight = right.includes(id)

        if (inLeft) {
          draftViewOptions.widgetLayout.left = left.filter((w) => w !== id)
        } else if (inRight) {
          draftViewOptions.widgetLayout.right = right.filter((w) => w !== id)
        } else {
          draftViewOptions.widgetLayout.right.push(id)
        }
      })
    },
    [setCurrentViewOptions],
  )

  return {
    widgetLayout: currentViewOptions.widgetLayout,
    setWidgetLayout,
    resetWidgetLayout,
    toggleWidget,
  } as const
}
