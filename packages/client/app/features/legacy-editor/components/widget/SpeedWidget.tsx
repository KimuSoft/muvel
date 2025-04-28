import React, { Component, type FC, useMemo } from "react"
import { Widget, WidgetBody, WidgetHeader } from "./Widget"
import { HStack, IconButton, Spacer, Text, VStack } from "@chakra-ui/react"
import { BsSpeedometer } from "react-icons/bs"
import { BiReset } from "react-icons/bi"
import { Tooltip } from "~/components/ui/tooltip"
import ProgressBar from "~/features/legacy-editor/components/atoms/ProgressBar"
import { useBlockEditor } from "~/features/legacy-editor/context/EditorContext"

class SpeedWidget_ extends Component<{ length: number; episodeId: string }> {
  state = {
    speed: 0,
    avgSpeed: 0,
    lengths: [] as number[],
    timer: 0,
  }

  constructor(props: { length: number; episodeId: string }) {
    super(props)
  }

  speedTime = 3

  timerLoop() {
    if (
      this.state.lengths.length === 1 &&
      this.state.lengths[0] === this.props.length
    ) {
    } else if (this.props.length) {
      let lengths_: number[]
      if (this.state.lengths.length < 60) {
        lengths_ = [...this.state.lengths, this.props.length]
      } else {
        lengths_ = [...this.state.lengths.slice(1, 60), this.props.length]
      }

      this.setState({ lengths: lengths_ })

      if (lengths_.length < this.speedTime + 1) {
        this.setState({ speed: 0 })
      } else {
        const _speed =
          (lengths_[lengths_.length - 1] -
            lengths_[lengths_.length - this.speedTime - 1]) /
          this.speedTime

        const _avgSpeed =
          (lengths_[lengths_.length - 1] - lengths_[0]) / (lengths_.length - 1)

        this.setState({
          speed: Math.round(_speed * 60),
          avgSpeed: Math.round(_avgSpeed * 60),
        })
      }
    }

    const timer = setTimeout(this.timerLoop.bind(this), 1000)
    this.setState({ timer })
  }

  componentDidMount() {
    this.timerLoop()
  }

  componentDidUpdate(
    prevProps: Readonly<{ episodeId: string }>,
    prevState: Readonly<{ episodeId: string }>,
  ) {
    if (prevProps.episodeId !== this.props.episodeId) {
      this.reset()
    }
  }

  componentWillUnmount() {
    clearTimeout(this.state.timer)
  }

  reset() {
    this.setState({ lengths: [], speed: 0, avgSpeed: 0 })
  }

  render() {
    return (
      <Widget>
        <WidgetHeader>
          <BsSpeedometer />
          <Text>속도계 위젯</Text>
          <Spacer />
          <Tooltip content={"속도 저장값 초기화하기"}>
            <IconButton aria-label={"reset"} size="xs" onClick={this.reset}>
              <BiReset size={15} />
            </IconButton>
          </Tooltip>
        </WidgetHeader>
        <WidgetBody>
          <VStack w={"100%"}>
            <HStack w={"100%"}>
              <HStack w={"120px"} gap={1}>
                <Text>{this.state.speed}</Text>
                <Text fontSize={"xs"} color={"gray.500"}>
                  l/m
                </Text>
              </HStack>
              <ProgressBar max={400} value={this.state.speed || 0} />
            </HStack>
            <HStack w={"100%"}>
              <HStack w={"120px"} gap={1}>
                <Text>{this.state.avgSpeed}</Text>
                <Text fontSize={"xs"} color={"gray.500"}>
                  avg l/m
                </Text>
              </HStack>
              <ProgressBar max={400} value={this.state.avgSpeed || 0} />
            </HStack>
            <Text fontSize={"xs"} color={"gray.500"}>
              한 편 쓰는 데 걸리는 시간:{" "}
              {Math.round(5000 / this.state.avgSpeed)} 분
            </Text>
          </VStack>
        </WidgetBody>
      </Widget>
    )
  }
}

const SpeedWidget: FC = () => {
  const { blocks, episode } = useBlockEditor()

  const length = useMemo(
    () => blocks.map((b) => b.content.length).reduce((a, b) => a + b, 0),
    [blocks],
  )

  return <SpeedWidget_ length={length} episodeId={episode.id} />
}

// const SpeedWidget: React.FC = () => {
//   const [blocks] = useRecoilState(blocksState)
//
//   const [speed, setSpeed] = useState<number>(0)
//   const [avgSpeed, setAvgSpeed] = useState<number>(0)
//
//   const [isRunning, setIsRunning] = useState<boolean>(false)
//
//   const length = useRef(0)
//   const lengths = useRef<number[]>([])
//
//   // 순간 속도: 1초마다 블록 긁어서 글자 수 세기
//   // 평균 속도: 저장된 최근 1분 (60개) 데이터 계산)
//   // blocks 변경된 순간 타이머 시작
//
//   const timerLoop = () => {
//     if (length.current) {
//       lengths.current = [...lengths.current.slice(0, 59), length.current]
//       console.log(lengths.current)
//     }
//     setTimeout(timerLoop, 1000)
//   }
//
//   useEffect(() => {
//     length.current = blocksToText(blocks).length
//
//     if (isRunning) return
//     setIsRunning(true)
//     console.log("루프 시작")
//     timerLoop()
//   }, [blocks])
//
//   // 순간 속도를 계산할 시간
//   const speedTime = 3
//
//   useEffect(() => {
//     console.log(lengths.current.length)
//     const lengths_ = lengths.current
//     if (lengths_.length < speedTime + 1) return setSpeed(0)
//
//     const _speed =
//       (lengths_[lengths_.length - 1] -
//         lengths_[lengths_.length - speedTime - 1]) /
//       speedTime
//     setSpeed(Math.round(_speed * 60))
//   }, [lengths.current])
//
//   return (
//     <Widget>
//       <WidgetHeader>
//         <BsSpeedometer />
//         <Text>타자 속도 위젯</Text>
//       </WidgetHeader>
//       <WidgetBody>
//         <Progress value={speed || 0} />
//         <Text>
//           {speed} letter/min
//           {lengths.current.length}개
//         </Text>
//       </WidgetBody>
//     </Widget>
//   )
// }

export default SpeedWidget
