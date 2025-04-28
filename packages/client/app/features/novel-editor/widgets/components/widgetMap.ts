// features/editor/widgets/components/widgetMap.ts

import { CharCountWidget } from "./CharCountWidget"
import { SymbolWidget } from "~/features/novel-editor/widgets/components/SymbolWidget"
import type { DraggableAttributes } from "@dnd-kit/core"
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities"
import { MemoWidget } from "~/features/novel-editor/widgets/components/MemoWidget"
import { StopwatchWidget } from "~/features/novel-editor/widgets/components/StopwatchWidget"
import { DiceWidget } from "~/features/novel-editor/widgets/components/DiceWidget"
import { SpeedometerWidget } from "~/features/novel-editor/widgets/components/SpeedometerWidget"
import { DictionaryWidget } from "~/features/novel-editor/widgets/components/DictWidget"

export interface WidgetBaseProps {
  dragAttributes?: DraggableAttributes
  dragListeners?: SyntheticListenerMap
}

export const widgetMap = {
  charCount: CharCountWidget,
  symbol: SymbolWidget,
  memo: MemoWidget,
  stopwatch: StopwatchWidget,
  dice: DiceWidget,
  speedometer: SpeedometerWidget,
  dictionary: DictionaryWidget,
}

export type WidgetId = keyof typeof widgetMap
