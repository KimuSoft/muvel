import React, {
  createContext,
  type ReactNode,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react"
import { produce } from "immer" // immer를 import 합니다.
import type { WidgetId } from "../components/widgetMap" // WidgetId 타입을 가져옵니다. (경로는 실제 프로젝트에 맞게 조정)

// 위젯 레이아웃 타입 정의
export type WidgetSide = "left" | "right"
export interface WidgetLayout {
  left: WidgetId[]
  right: WidgetId[]
}

// 위젯 설정과 레이아웃을 포함하는 전체 상태 타입 정의
export interface WidgetConfig {
  layout: WidgetLayout
  // 각 위젯 ID를 키로 하고, 해당 위젯의 옵션 객체를 값으로 가집니다.
  // Record<string, any>를 사용하여 유연성을 확보합니다.
  options: Record<string, Record<string, any>>
}

// 기본 레이아웃 및 설정값 정의
const defaultLayout: WidgetLayout = {
  left: [],
  right: ["charCount"], // 기본적으로 'charCount' 위젯을 오른쪽에 배치
}

const defaultConfig: WidgetConfig = {
  layout: defaultLayout,
  options: {}, // 초기 옵션은 비어있는 객체
}

// Context에서 제공할 값들의 타입 정의
interface WidgetContextValue {
  config: WidgetConfig
  // 레이아웃 업데이트 함수
  updateLayout: (updater: (draft: WidgetLayout) => void) => void
  // 특정 위젯의 옵션 업데이트 함수
  updateWidgetOption: <T extends Record<string, any>>(
    id: WidgetId,
    updater: (draft: T) => void,
    defaultOptions?: T, // 기본 옵션 추가
  ) => void
  // 위젯 표시/숨김 토글 함수
  toggleWidget: (id: WidgetId) => void
  // 특정 위젯의 옵션을 가져오는 함수 (훅 내부에서 사용)
  getWidgetOptions: <T extends Record<string, any>>(
    id: WidgetId,
    defaultOptions?: T,
  ) => T
}

// WidgetContext 생성
const WidgetContext = createContext<WidgetContextValue | undefined>(undefined)

// localStorage 키 정의
const LOCAL_STORAGE_KEY = "muvel-widget-config" // 키 이름 변경

// WidgetProvider 컴포넌트 구현
export const WidgetProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<WidgetConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      // 저장된 값이 있으면 파싱하고, 없으면 기본 설정 사용
      // 파싱 중 오류 발생 시 기본 설정 사용
      return saved ? JSON.parse(saved) : defaultConfig
    } catch (error) {
      console.error("Failed to load widget config from localStorage:", error)
      return defaultConfig
    }
  })

  // 상태 업데이트 및 localStorage 저장 로직을 공통 함수로 분리
  const updateConfig = (updater: (draft: WidgetConfig) => void) => {
    const nextState = produce(config, updater)
    setConfig(nextState)
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextState))
    } catch (error) {
      console.error("Failed to save widget config to localStorage:", error)
    }
  }

  // 레이아웃 업데이트 함수 (immer 사용)
  const updateLayout = useCallback(
    (updater: (draft: WidgetLayout) => void) => {
      updateConfig((draft) => {
        // 전체 config의 layout 부분만 업데이트
        updater(draft.layout)
      })
    },
    [updateConfig], // updateConfig가 변경될 때만 함수 재생성
  )

  // 특정 위젯 옵션 업데이트 함수 (immer 사용)
  const updateWidgetOption = useCallback(
    <T extends Record<string, any>>(
      id: WidgetId,
      updater: (draft: T) => void,
      defaultOptions?: T, // 기본 옵션 받기
    ) => {
      updateConfig((draft) => {
        // 해당 위젯 ID의 옵션이 없으면 기본 옵션으로 초기화
        if (!draft.options[id]) {
          draft.options[id] = defaultOptions || {}
        }
        // immer draft를 사용하여 해당 위젯의 옵션 업데이트
        // 타입 단언(as T)을 사용하여 updater 함수가 올바른 타입의 draft를 받도록 함
        updater(draft.options[id] as T)
      })
    },
    [updateConfig], // updateConfig가 변경될 때만 함수 재생성
  )

  // 위젯 토글 함수 (immer 사용)
  const toggleWidget = useCallback(
    (id: WidgetId) => {
      updateConfig((draft) => {
        const { left, right } = draft.layout
        const inLeft = left.includes(id)
        const inRight = right.includes(id)

        if (inLeft || inRight) {
          // 위젯이 존재하면 양쪽 사이드에서 모두 제거
          draft.layout.left = left.filter((w) => w !== id)
          draft.layout.right = right.filter((w) => w !== id)
        } else {
          // 위젯이 없으면 오른쪽에 추가 (기본 동작)
          draft.layout.right.push(id)
        }
      })
    },
    [updateConfig], // updateConfig가 변경될 때만 함수 재생성
  )

  // 특정 위젯 옵션을 가져오는 함수
  const getWidgetOptions = useCallback(
    <T extends Record<string, any>>(id: WidgetId, defaultOptions?: T): T => {
      // 현재 config에서 옵션을 가져오거나, 없으면 기본 옵션 또는 빈 객체 반환
      return (config.options[id] as T) ?? defaultOptions ?? ({} as T)
    },
    [config.options], // config.options가 변경될 때만 함수 재생성
  )

  // Context 값 구성 (useMemo 사용 최적화)
  const contextValue = useMemo(
    () => ({
      config,
      updateLayout,
      updateWidgetOption,
      toggleWidget,
      getWidgetOptions,
    }),
    [config, updateLayout, updateWidgetOption, toggleWidget, getWidgetOptions], // 의존성 배열에 함수들도 포함
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
    layout: config.layout, // 현재 레이아웃 상태
    updateLayout, // 레이아웃 업데이트 함수
    toggleWidget, // 위젯 토글 함수
  }
}

// 특정 위젯의 옵션을 다루는 훅
// T는 해당 위젯의 옵션 타입을 나타내는 제네릭 타입
export const useWidgetOption = <T extends Record<string, any>>(
  id: WidgetId,
  defaultOptions?: T, // 위젯의 기본 옵션값
) => {
  const { getWidgetOptions, updateWidgetOption } = useWidgetContext()

  // 현재 위젯의 옵션 가져오기
  // getWidgetOptions를 사용하여 옵션이 없거나 localStorage에서 로드되지 않았을 경우 defaultOptions 사용
  const options = useMemo(
    () => getWidgetOptions<T>(id, defaultOptions),
    [getWidgetOptions, id, defaultOptions], // 옵션 가져오는 로직 메모이제이션
  )

  // 특정 위젯의 옵션을 업데이트하는 함수
  // useCallback을 사용하여 함수 참조 안정성 보장
  const setOptions = useCallback(
    (updater: (draft: T) => void) => {
      // updateWidgetOption 호출 시 defaultOptions도 함께 전달하여
      // 혹시 상태에 해당 위젯 옵션이 없는 경우 기본값으로 생성되도록 함
      updateWidgetOption<T>(id, updater, defaultOptions)
    },
    [updateWidgetOption, id, defaultOptions], // 의존성 배열에 id와 defaultOptions 포함
  )

  // 현재 옵션 상태와 옵션을 업데이트하는 함수 반환
  return [options, setOptions] as const // `as const`로 반환 타입을 튜플로 고정
}
