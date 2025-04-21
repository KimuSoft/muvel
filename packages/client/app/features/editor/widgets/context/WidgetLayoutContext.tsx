import { createContext, type ReactNode, useContext, useState } from "react"
import type { WidgetId } from "../components/widgetMap"

export type WidgetSide = "left" | "right"
export interface WidgetLayout {
  left: WidgetId[]
  right: WidgetId[]
}

const defaultLayout: WidgetLayout = {
  left: [],
  right: ["charCount"],
}

interface WidgetLayoutContextValue {
  layout: WidgetLayout
  updateLayout: (next: WidgetLayout) => void
  toggleWidget: (id: WidgetId) => void
}

const WidgetLayoutContext = createContext<WidgetLayoutContextValue | undefined>(
  undefined,
)

export const WidgetLayoutProvider = ({ children }: { children: ReactNode }) => {
  const [layout, setLayout] = useState<WidgetLayout>(() => {
    const saved = localStorage.getItem("muvel-widgets")
    return saved ? JSON.parse(saved) : defaultLayout
  })

  const updateLayout = (next: WidgetLayout) => {
    setLayout(next)
    localStorage.setItem("muvel-widgets", JSON.stringify(next))
  }

  const toggleWidget = (id: WidgetId) => {
    const { left, right } = layout

    const inLeft = left.includes(id)
    const inRight = right.includes(id)

    // ❌ 존재 시 제거
    if (inLeft || inRight) {
      const updated: WidgetLayout = {
        left: left.filter((w) => w !== id),
        right: right.filter((w) => w !== id),
      }
      updateLayout(updated)
    } else {
      // ✅ 없으면 기본적으로 right에 추가
      updateLayout({
        ...layout,
        right: [...right, id],
      })
    }
  }

  return (
    <WidgetLayoutContext.Provider
      value={{ layout, updateLayout, toggleWidget }}
    >
      {children}
    </WidgetLayoutContext.Provider>
  )
}

export const useWidgetLayout = () => {
  const ctx = useContext(WidgetLayoutContext)
  if (!ctx)
    throw new Error(
      "useWidgetLayout must be used within a WidgetLayoutProvider",
    )
  return ctx
}
