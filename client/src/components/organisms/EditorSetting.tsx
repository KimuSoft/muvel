import React, { useEffect, useMemo } from "react"
import { CiSettings } from "react-icons/ci"
import {
  Button,
  FormControl,
  FormLabel,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { toast } from "react-toastify"
import useEditorSetting, {
  defaultOption,
  EditorOption,
} from "../../hooks/useEditorSetting"

const EditorSetting: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const initialOption = useEditorSetting()
  const [options, setOptions] = React.useState<EditorOption>(initialOption)

  useEffect(() => {
    try {
      localStorage["editorOption"] = JSON.stringify(options)
    } catch (e: any) {
      toast.error(
        `에디터 설정을 불러오는 데 실패하여 자동으로 초기화되었어요! - ` +
          e.toString()
      )
      localStorage["editorOption"] = JSON.stringify(defaultOption)
    }
  }, [options])

  return (
    <>
      <IconButton
        aria-label={"에디터 설정"}
        icon={<CiSettings />}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>에디터 설정하기</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>행 간격: {options.lineHeight}px</FormLabel>
              <Slider
                aria-label="slider-ex-1"
                defaultValue={options.lineHeight}
                value={options.lineHeight}
                onChange={(value: number) =>
                  setOptions({ ...options, lineHeight: value })
                }
                min={12}
                max={40}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </FormControl>
            <FormControl>
              <FormLabel>글자 크기: {options.fontSize}px</FormLabel>
              <Slider
                aria-label="slider-ex-1"
                defaultValue={options.fontSize}
                value={options.fontSize}
                onChange={(value: number) =>
                  setOptions({ ...options, fontSize: value })
                }
                min={6}
                max={36}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </FormControl>
            <Text>※ 에디터 설정은 새로고침 후에 적용됩니다. </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => setOptions(defaultOption)}
            >
              기본값 복원
            </Button>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              닫기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default EditorSetting
