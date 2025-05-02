import React, {
  createContext,
  type ReactNode,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react"
import { produce } from "immer"
import type { WidgetId } from "../components/widgetMap" // 경로는 실제 프로젝트에 맞게 조정

// 위젯 레이아웃 타입 정의
export type WidgetSide = "left" | "right"
export interface WidgetLayout {
  left: WidgetId[]
  right: WidgetId[]
}

// 위젯 설정과 레이아웃을 포함하는 전체 상태 타입 정의
export interface WidgetConfig {
  layout: WidgetLayout
  options: Record<string, Record<string, any>> // WidgetId 대신 string 사용 (유연성)
}

// 기본 레이아웃 및 설정값 정의
const defaultLayout: WidgetLayout = {
  left: [],
  right: ["charCount"],
}

const defaultConfig: WidgetConfig = {
  layout: defaultLayout,
  options: {},
}

// Context에서 제공할 값들의 타입 정의
interface WidgetContextValue {
  config: WidgetConfig
  updateLayout: (updater: (draft: WidgetLayout) => void) => void
  updateWidgetOption: <T extends Record<string, any>>(
    id: string, // WidgetId 대신 string 사용
    updater: (draft: T) => void,
    defaultOptions?: T,
  ) => void
  toggleWidget: (id: string) => void // WidgetId 대신 string 사용
  getWidgetOptions: <T extends Record<string, any>>(
    id: string, // WidgetId 대신 string 사용
    defaultOptions?: T,
  ) => T
}

// WidgetContext 생성
const WidgetContext = createContext<WidgetContextValue | undefined>(undefined)

// localStorage 키 정의
const LOCAL_STORAGE_KEY = "muvel-widget-config"

// WidgetProvider 컴포넌트 구현
export const WidgetProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<WidgetConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      // 저장된 값이 있으면 파싱하고, 없으면 기본 설정 사용
      // 파싱 중 오류 발생 시 기본 설정 사용
      // 주의: 저장된 값과 defaultConfig의 구조가 다를 수 있으므로,
      // 로드 시 병합 로직을 추가하는 것도 고려할 수 있습니다. (현재는 단순 파싱)
      return saved ? JSON.parse(saved) : defaultConfig
    } catch (error) {
      console.error("Failed to load widget config from localStorage:", error)
      return defaultConfig
    }
  })

  // 상태 업데이트 및 localStorage 저장 로직
  const updateConfig = useCallback(
    (updater: (draft: WidgetConfig) => void) => {
      // immer의 produce를 사용하여 불변성 유지 및 업데이트
      const nextState = produce(config, updater)
      setConfig(nextState) // 상태 업데이트
      try {
        // localStorage에 저장
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextState))
      } catch (error) {
        console.error("Failed to save widget config to localStorage:", error)
      }
    },
    [config],
  ) // config가 변경될 때만 함수 재생성 (주의: updateConfig 자체는 잘 변하지 않음)

  // 레이아웃 업데이트 함수
  const updateLayout = useCallback(
    (updater: (draft: WidgetLayout) => void) => {
      updateConfig((draft) => {
        updater(draft.layout)
      })
    },
    [updateConfig],
  )

  // 특정 위젯 옵션 업데이트 함수
  const updateWidgetOption = useCallback(
    <T extends Record<string, any>>(
      id: string, // WidgetId 대신 string 사용
      updater: (draft: T) => void,
      defaultOptions?: T,
    ) => {
      updateConfig((draft) => {
        // 해당 위젯 ID의 옵션이 없으면 기본 옵션으로 초기화
        if (!draft.options[id]) {
          // 기본 옵션이 있으면 사용, 없으면 빈 객체로 초기화
          draft.options[id] = defaultOptions ?? {}
        }
        // immer draft를 사용하여 해당 위젯의 옵션 업데이트
        updater(draft.options[id] as T)
      })
    },
    [updateConfig],
  )

  // 위젯 토글 함수
  const toggleWidget = useCallback(
    (id: string) => {
      // WidgetId 대신 string 사용
      updateConfig((draft) => {
        const { left, right } = draft.layout
        const widgetId = id as WidgetId // 내부에서는 WidgetId로 캐스팅하여 사용 (타입 일관성 위해)
        const inLeft = left.includes(widgetId)
        const inRight = right.includes(widgetId)

        if (inLeft || inRight) {
          draft.layout.left = left.filter((w) => w !== widgetId)
          draft.layout.right = right.filter((w) => w !== widgetId)
        } else {
          // 기본적으로 오른쪽에 추가
          draft.layout.right.push(widgetId)
        }
      })
    },
    [updateConfig],
  )

  // === 수정된 getWidgetOptions 함수 ===
  // 특정 위젯 옵션을 가져오는 함수 (기본값과 병합)
  const getWidgetOptions = useCallback(
    <T extends Record<string, any>>(
      id: string, // WidgetId 대신 string 사용
      defaultOptions?: T,
    ): T => {
      // 현재 저장된 옵션 가져오기
      const loadedOptions = config.options[id] as T | undefined
      // 기본 옵션 정의 (없으면 빈 객체)
      const defaults = defaultOptions ?? ({} as T)

      // 기본 옵션과 저장된 옵션을 병합. 저장된 값이 우선됨.
      // 이렇게 하면 저장된 값에 없는 필드는 기본값으로 채워짐.
      return { ...defaults, ...loadedOptions }
    },
    [config.options], // config.options가 변경될 때만 함수 재생성
  )
  // ==================================

  // Context 값 구성 (useMemo 사용 최적화)
  const contextValue = useMemo(
    () => ({
      config,
      updateLayout,
      updateWidgetOption,
      toggleWidget,
      getWidgetOptions,
    }),
    [config, updateLayout, updateWidgetOption, toggleWidget, getWidgetOptions],
  )

  return (
    <WidgetContext.Provider value={contextValue}>
      {children}
    </WidgetContext.Provider>
  )
}

// useWidgetContext 훅 (내부 사용)
const useWidgetContext = () => {
  const ctx = useContext(WidgetContext)
  if (!ctx) {
    throw new Error("useWidgetContext must be used within a WidgetProvider")
  }
  return ctx
}

// 레이아웃 관련 기능만 노출하는 훅
export const useWidgetLayout = () => {
  const { config, updateLayout, toggleWidget } = useWidgetContext()
  return {
    layout: config.layout,
    updateLayout,
    toggleWidget,
  }
}

// 특정 위젯의 옵션을 다루는 훅
export const useWidgetOption = <T extends Record<string, any>>(
  id: string, // WidgetId 대신 string 사용
  defaultOptions?: T,
) => {
  const { getWidgetOptions, updateWidgetOption } = useWidgetContext()

  // 수정된 getWidgetOptions를 사용하여 옵션 가져오기 (병합 로직 포함)
  const options = useMemo(
    () => getWidgetOptions<T>(id, defaultOptions),
    [getWidgetOptions, id, defaultOptions], // getWidgetOptions 참조 안정성 중요
  )

  // 특정 위젯의 옵션을 업데이트하는 함수
  const setOptions = useCallback(
    (updater: (draft: T) => void) => {
      // updateWidgetOption 호출 시 defaultOptions도 전달하여
      // 혹시 상태에 해당 위젯 옵션이 없는 경우 기본값으로 생성되도록 함
      updateWidgetOption<T>(id, updater, defaultOptions)
    },
    [updateWidgetOption, id, defaultOptions],
  )

  return [options, setOptions] as const
}
