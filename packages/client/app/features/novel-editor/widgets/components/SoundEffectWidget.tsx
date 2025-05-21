import React, { useEffect, useRef, useState } from "react"
import {
  WidgetBase,
  WidgetHeader,
  WidgetTitle,
} from "~/features/novel-editor/widgets/containers/WidgetBase"
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap"
import { FaVolumeHigh } from "react-icons/fa6"
import { Howl } from "howler"
import { HStack, Slider } from "@chakra-ui/react"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"
import { throttle } from "lodash-es"

export const SoundEffectWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  const { view } = useEditorContext()
  const howlRef = useRef<Howl | null>(null)
  const [volume, setVolume] = useState(0.5)
  const volumeRef = useRef(volume)

  // 최신 volume 값 유지
  useEffect(() => {
    volumeRef.current = volume
  }, [volume])

  // 스로틀된 재생 함수 (80ms 간격 제한)
  const playThrottled = useRef(
    throttle(() => {
      if (howlRef.current) {
        howlRef.current.volume(volumeRef.current)
        howlRef.current.play()
      }
    }, 80),
  ).current

  useEffect(() => {
    if (!view) return

    howlRef.current = new Howl({
      src: ["/sounds/type1.mp3"],
      volume,
    })

    const handleKeydown = (e: KeyboardEvent) => {
      if (
        e.key.length === 1 || // 일반 문자 키
        e.key === "Process" ||
        e.key === "Enter" ||
        e.key === "Backspace"
      ) {
        playThrottled()
      }
    }

    const editorDom = view.dom
    editorDom.addEventListener("keydown", handleKeydown)
    return () => {
      editorDom.removeEventListener("keydown", handleKeydown)
    }
  }, [view, playThrottled])

  return (
    <WidgetBase>
      <WidgetHeader>
        <HStack
          justify="space-between"
          w="100%"
          {...dragAttributes}
          {...dragListeners}
        >
          <HStack>
            <FaVolumeHigh />
            <WidgetTitle>효과음 위젯</WidgetTitle>
          </HStack>
          <Slider.Root
            w="100px"
            value={[volume * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={({ value }) => {
              setVolume(value[0] / 100)
            }}
          >
            <Slider.Control>
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumb index={0} />
            </Slider.Control>
          </Slider.Root>
        </HStack>
      </WidgetHeader>
    </WidgetBase>
  )
}
