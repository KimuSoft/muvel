import DiceWidget from "./DiceWidget"
import GoalWidget from "./GoalWidget"
import SymbolWidget from "./SymbolWidget"
import DictWidget from "./DictWidget"
import React from "react"
import { IconType } from "react-icons"
import { ImCalculator } from "react-icons/im"
import { BsDice6Fill } from "react-icons/bs"
import { RiCharacterRecognitionFill } from "react-icons/ri"
import { AiOutlineBook } from "react-icons/ai"

export const widgetData: IWidget[] = [
  {
    id: "goal",
    component: <GoalWidget key={"goal-widget"} />,
    name: "글자 수 세기 위젯",
    description: "글자 수 목표를 설정하고, 지정 목표를 돌파하면 알려드릴게요.",
    icon: ImCalculator,
  },
  {
    id: "dice",
    component: <DiceWidget key={"dice-widget"} />,
    name: "주사위 위젯",
    description:
      "여러 종류의 주사위를 소환해서 굴릴 수 있어요. 이게 글쓰는데 왜 필요하냐고요? 저도 몰라요.",
    icon: BsDice6Fill,
  },
  {
    id: "symbol",
    component: <SymbolWidget key={"symbol-widget"} />,
    name: "특수문자 위젯",
    description:
      "키보드로 입력하기 힘들지만 자주 사용하는 특수문자를 손쉽게 복사할 수 있는 위젯이에요.",
    icon: RiCharacterRecognitionFill,
  },
  {
    id: "dict",
    component: <DictWidget key={"dict-widget"} />,
    name: "빠른 사전 위젯",
    description:
      "이 단어는 띄어써야 하는 걸까? 빠른 사전을 통해 단어를 찾아보세요.",
    icon: AiOutlineBook,
  },
]

export interface IWidget {
  id: string
  component: React.ReactNode
  name: string
  description: string
  icon: IconType
}
