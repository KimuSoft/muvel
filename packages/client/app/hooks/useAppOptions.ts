import { useCallback, useContext } from "react"
import { type Draft } from "immer"
import { cloneDeep } from "lodash-es" // lodash-es에서 cloneDeep 임포트
import { OptionContext, SetOptionContext } from "~/providers/AppOptionProvider"
import type {
  AppExportOptions,
  EditorStyleOptions,
  ViewOptions,
  WidgetInstanceId,
  WidgetLayout,
  WidgetSettings,
} from "~/types/options"
import {
  defaultAppExportOptions,
  defaultEditorStyleOptions,
  defaultViewOptions,
  defaultWidgetSettings,
} from "~/types/defaultOptions"
import type { WidgetId } from "~/features/novel-editor/widgets/components/widgetMap"

export const useAppOptionsContext = () => {
  const options = useContext(OptionContext)
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
          draftAll.editorStyle = result
        }
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
  defaultOptions?: T,
) => {
  const [allWidgetSettings, setAllWidgetSettings, _resetAllWidgetSettings] =
    useWidgetSettingsContext()

  const setSettings = useCallback(
    (updater: (draft: Draft<T>) => void | T) => {
      setAllWidgetSettings((draftAllSettings) => {
        // 위젯 설정이 존재하지 않고 기본값이 있다면, 깊은 복사로 생성
        if (!draftAllSettings[widgetInstanceId] && defaultOptions) {
          draftAllSettings[widgetInstanceId] = cloneDeep(defaultOptions)
        } else if (!draftAllSettings[widgetInstanceId]) {
          // 기본값도 없으면 빈 객체로 초기화 (타입 T에 맞게)
          draftAllSettings[widgetInstanceId] = {} as T
        }

        const result = updater(draftAllSettings[widgetInstanceId] as Draft<T>)
        if (result !== undefined) {
          // updater가 새 객체를 반환하면 그대로 할당
          draftAllSettings[widgetInstanceId] = result
        }
        // updater가 void를 반환하면 draftAllSettings[widgetInstanceId]의 변경사항이 적용됨 (immer 기본 동작)
      })
    },
    [setAllWidgetSettings, widgetInstanceId, defaultOptions],
  )

  const resetSettings = useCallback(() => {
    setAllWidgetSettings((draftAllSettings) => {
      if (defaultOptions) {
        // 리셋 시에도 깊은 복사된 기본값 사용
        draftAllSettings[widgetInstanceId] = cloneDeep(defaultOptions)
      } else {
        // defaultOptions가 없으면 해당 위젯 설정을 삭제할 수도 있음
        delete draftAllSettings[widgetInstanceId]
      }
    })
  }, [setAllWidgetSettings, widgetInstanceId, defaultOptions])

  // 현재 설정을 가져올 때:
  // 1. 기본 옵션이 있다면 깊은 복사본을 만든다. (원본 defaultOptions 객체 불변성 유지)
  // 2. 저장된 위젯 설정이 있다면, 기본값 복사본 위에 덮어쓴다. (얕은 병합으로 충분)
  const baseSettings = defaultOptions ? cloneDeep(defaultOptions) : ({} as T)
  const currentSettings = allWidgetSettings[widgetInstanceId]
    ? { ...baseSettings, ...allWidgetSettings[widgetInstanceId] } // 저장된 값으로 덮어쓰기
    : baseSettings // 저장된 값 없으면 복사된 기본값 사용

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
