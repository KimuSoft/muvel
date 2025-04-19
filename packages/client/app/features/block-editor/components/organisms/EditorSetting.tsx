import React, { useState } from "react"
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Field,
  HStack,
  IconButton,
  Portal,
  Slider,
} from "@chakra-ui/react"
import { AiFillSetting } from "react-icons/ai"

import { useOption } from "~/context/OptionContext"
import { Tooltip } from "~/components/ui/tooltip"
import ContentEditableBlock from "~/features/block-editor/components/atoms/MuvelBlock/ContentEditableBlock"
import { sampleBlock, sampleLegacyBlock } from "muvel-api-types"
import { defaultOption } from "~/providers/OptionProvider"

const EditorSetting: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useOption()

  return (
    <Dialog.Root open={open} onOpenChange={(d) => setOpen(d.open)}>
      <Dialog.Trigger asChild>
        <Tooltip content="에디터 디자인 설정하기" openDelay={500}>
          <IconButton aria-label="에디터 설정" variant="outline">
            <AiFillSetting />
          </IconButton>
        </Tooltip>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <DialogHeader>
              에디터 설정하기
              <Dialog.CloseTrigger asChild>
                <CloseButton position="absolute" top="3" right="3" />
              </Dialog.CloseTrigger>
            </DialogHeader>

            <DialogBody>
              {/* 미리보기 */}
              <Field.Root mb={7}>
                <Field.Label>블록 미리보기</Field.Label>
                <Box w="100%" bgColor={{ base: "gray.100", _dark: "gray.800" }}>
                  <ContentEditableBlock
                    block={sampleLegacyBlock}
                    position={-7}
                    disabled
                  />
                </Box>
              </Field.Root>

              {/* 줄 높이 */}
              <Field.Root mb={5}>
                <Field.Label>줄 높이: {options.lineHeight}px</Field.Label>
                <Slider.Root
                  min={12}
                  max={56}
                  value={[options.lineHeight]}
                  onValueChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      lineHeight: e.value[0],
                    }))
                  }
                >
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumbs />
                </Slider.Root>
              </Field.Root>

              {/* 행 간격 */}
              <Field.Root mb={5}>
                <Field.Label>행 간격: {options.gap}px</Field.Label>
                <Slider.Root
                  min={0}
                  max={16}
                  value={[options.gap]}
                  onValueChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      gap: e.value[0],
                    }))
                  }
                >
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumbs />
                </Slider.Root>
              </Field.Root>

              {/* 글자 크기 */}
              <Field.Root mb={5}>
                <Field.Label>글자 크기: {options.fontSize}px</Field.Label>
                <Slider.Root
                  min={6}
                  max={32}
                  value={[options.fontSize]}
                  onValueChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      fontSize: e.value[0],
                    }))
                  }
                >
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumbs />
                </Slider.Root>
              </Field.Root>

              {/* 들여쓰기 */}
              <Field.Root>
                <Field.Label>들여쓰기: {options.indent}em</Field.Label>
                <Slider.Root
                  min={0}
                  max={4}
                  step={0.1}
                  value={[options.indent]}
                  onValueChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      indent: e.value[0],
                    }))
                  }
                >
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumbs />
                </Slider.Root>
              </Field.Root>
            </DialogBody>

            <DialogFooter>
              <HStack w="100%" justify="flex-end">
                <Button
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => setOptions(() => defaultOption)}
                >
                  기본값 복원
                </Button>
                <Button colorScheme="blue" onClick={() => setOpen(false)}>
                  닫기
                </Button>
              </HStack>
            </DialogFooter>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default EditorSetting
