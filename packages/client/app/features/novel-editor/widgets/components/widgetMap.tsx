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
import { FindReplaceWidget } from "~/features/novel-editor/widgets/components/FindReplaceWidget"
import React from "react"
import { GoNumber } from "react-icons/go"
import { RiCharacterRecognitionFill } from "react-icons/ri"
import { FaBookBookmark, FaDiceSix, FaEllipsis } from "react-icons/fa6"
import { MdFindReplace, MdOutlineTimer } from "react-icons/md"
import { IoSpeedometerOutline } from "react-icons/io5"
import { BiNotepad } from "react-icons/bi"
import { SymbolReplaceWidget } from "~/features/novel-editor/widgets/components/SymbolReplaceWidget"
import { AuthorCommentWidget } from "~/features/novel-editor/widgets/components/AuthorCommentWidget"
import { LuBookMarked, LuMessageSquareQuote } from "react-icons/lu"
import { EpisodeReferenceWidget } from "~/features/novel-editor/widgets/components/EpisodeReferenceWidget"

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
  findReplace: FindReplaceWidget,
  symbolReplace: SymbolReplaceWidget,
  authorComment: AuthorCommentWidget,
  episodeReference: EpisodeReferenceWidget,
}

export interface WidgetButtonProps {
  id: string
  name: string
  description: string
  icon: React.ReactNode
}

export const widgets: WidgetButtonProps[] = [
  {
    id: "charCount",
    name: "글자 수 세기",
    description:
      "실시간으로 여러 기준에 따라 글자 수를 계산하고, 목표를 설정할 수 있는 위젯입니다.",
    icon: <GoNumber size={64} />,
  },
  {
    id: "symbol",
    name: "특수문자 입력",
    description:
      "소설에서 사용하는 다양한 특수문자를 쉽게 입력할 수 있습니다. 원하는 문자를 추가할 수도 있습니다.",
    icon: <RiCharacterRecognitionFill size={64} />,
  },
  {
    id: "dictionary",
    name: "사전 검색",
    description: "단어를 빠르게 검색하고 찾을 수 있습니다.",
    icon: <FaBookBookmark size={42} />,
  },
  {
    id: "stopwatch",
    name: "스톱워치 위젯",
    description: "글을 쓰는 시간을 측정할 수 있는 위젯입니다.",
    icon: <MdOutlineTimer size={50} />,
  },
  {
    id: "speedometer",
    name: "속도계 위젯",
    description:
      "실시간 글 집필 속도와 예상 소요 시간을 계산해주는 위젯입니다.",
    icon: <IoSpeedometerOutline size={50} />,
  },
  {
    id: "memo",
    name: "공유 메모장",
    description: "소설을 쓰면서 필요한 메모를 작성할 수 있는 위젯입니다.",
    icon: <BiNotepad size={50} />,
  },
  {
    id: "dice",
    name: "주사위 위젯",
    description:
      "내 소설 전개를 하늘에 맡기고 싶은 무책임한 작가를 위한 위젯입니다.",
    icon: <FaDiceSix size={50} />,
  },
  {
    id: "findReplace",
    name: "찾기 & 바꾸기",
    description:
      "소설에서 특정 단어를 찾고, 다른 단어로 바꿀 수 있는 위젯입니다.",
    icon: <MdFindReplace size={50} />,
  },
  {
    id: "symbolReplace",
    name: "기호 대치",
    description:
      "뮤블 밖에서 소설을 가져온 경우 말줄임표나 따옴표 등을 소설에 맞는 기호 형태로 바꿔주는 위젯입니다.",
    icon: <FaEllipsis size={50} />,
  },
  {
    id: "authorComment",
    name: "작가의 말",
    description: "해당 회차의 작가의 말을 작성할 수 있는 위젯입니다.",
    icon: <LuMessageSquareQuote size={50} />,
  },
  {
    id: "episodeReference",
    name: "회차 참조",
    description: "다른 회차를 참고하면서 글을 쓸 수 있게 해주는 위젯입니다.",
    icon: <LuBookMarked size={50} />,
  },
]

export type WidgetId = keyof typeof widgetMap
