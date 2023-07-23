import React, { useEffect, useState } from "react"
import { Widget, WidgetBody, WidgetHeader } from "./Widget"
import { Progress, Text } from "@chakra-ui/react"
import { BsSpeedometer } from "react-icons/bs"
import { blocksState } from "../../../recoil/editor"
import { useRecoilState } from "recoil"
import blocksToText from "../../../utils/blocksToText"

const SpeedWidget: React.FC = () => {
  const [blocks] = useRecoilState(blocksState)

  // 1초마다 저장
  const [lengths, setLengths] = useState<number[]>([])
  const [speed, setSpeed] = useState<number>(0)
  const [avgSpeed, setAvgSpeed] = useState<number>(0)

  const [isRunning, setIsRunning] = useState<boolean>(false)

  // 순간 속도: 1초마다 블록 긁어서 글자 수 세기
  // 평균 속도: 저장된 최근 1분 (60개) 데이터 계산)
  // blocks 변경된 순간 타이머 시작

  useEffect(() => {
    if (isRunning) return console.log("이미 실행중")
    setIsRunning(true)
    const timer = setInterval(() => {
      setLengths((l) => [...l.slice(0, 58), blocksToText(blocks).length])
    }, 1000)

    return () => {
      console.log("클리어!")
      clearInterval(timer)
    }
  }, [blocks])

  // 순간 속도를 계산할 시간
  const speedTime = 3

  useEffect(() => {
    if (lengths.length < speedTime + 1) return setSpeed(0)
    console.log(lengths)

    const _speed =
      (lengths[lengths.length - 1] - lengths[lengths.length - speedTime - 1]) /
      speedTime
    setSpeed(Math.round(_speed))
  }, [lengths])

  return (
    <Widget>
      <WidgetHeader>
        <BsSpeedometer />
        <Text>타자 속도 위젯</Text>
      </WidgetHeader>
      <WidgetBody>
        <Progress value={speed || 0} />
        <Text>{speed} letter/sec</Text>
      </WidgetBody>
    </Widget>
  )
}

export default SpeedWidget
