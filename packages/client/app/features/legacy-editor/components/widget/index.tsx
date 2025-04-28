import DiceWidget from "./DiceWidget"
import GoalWidget from "./GoalWidget"
import SymbolWidget from "./SymbolWidget"
import React from "react"
import { type IconType } from "react-icons"
import { ImCalculator } from "react-icons/im"
import { BsDice6Fill, BsDiscord, BsSpeedometer } from "react-icons/bs"
import { RiCharacterRecognitionFill } from "react-icons/ri"
import SpeedWidget from "./SpeedWidget"
import ReplaceWidget from "./ReplaceWidget"
import { MdFindReplace } from "react-icons/md"
import ChatToNovelWidget from "./ChatToNovelWidget"

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
  // {
  //   id: "dict",
  //   component: <DictWidget key={"dict-widget"} />,
  //   name: "빠른 사전 위젯",
  //   description:
  //     "이 단어는 띄어써야 하는 걸까? 빠른 사전을 통해 단어를 찾아보세요.",
  //   icon: AiOutlineBook,
  // },
  {
    id: "speed",
    component: <SpeedWidget key={"speed-widget"} />,
    name: "속도계 위젯",
    description:
      "현재 글을 쓰는 속도와 그 속도로 한 편을 작성하는데 걸리는 시간을 계산해 주는 위젯이에요.",
    icon: BsSpeedometer,
  },
  {
    id: "replace",
    component: <ReplaceWidget key={"replace-widget"} />,
    name: "텍스트 바꾸기 위젯",
    description:
      "글을 쓰다 보면 일괄적으로 표현을 모두 교체해야 하는 경우가 있죠. 아 참고로 Ctrl + Z는 안 되니 신중하게 쓰세요!",
    icon: MdFindReplace,
  },
  {
    id: "chat-to-novel",
    component: <ChatToNovelWidget key={"chat-to-novel-widget"} />,
    name: "디스코드 채팅 소설 변환기",
    description:
      "이 위젯은 디스코드 채팅에서 한 상황극을 소설로 옮겨 줄 거예요!",
    icon: BsDiscord,
  },
]

export interface IWidget {
  id: string
  component: React.ReactNode
  name: string
  description: string
  icon: IconType
}
