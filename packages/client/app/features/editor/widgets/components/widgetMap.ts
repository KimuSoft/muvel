// features/editor/widgets/components/widgetMap.ts

import { CharCountWidget } from "./CharCountWidget"
import { SymbolWidget } from "~/features/editor/widgets/components/SymbolWidget"
import type { DraggableAttributes } from "@dnd-kit/core"
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities"

export interface WidgetBaseProps {
  dragAttributes?: DraggableAttributes
  dragListeners?: SyntheticListenerMap
}

export const widgetMap = {
  charCount: CharCountWidget,
  symbol: SymbolWidget,
}

export type WidgetId = keyof typeof widgetMap
