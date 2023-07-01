import React, { useContext, useEffect, useMemo } from "react"
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
import EditorContext from "../../context/EditorContext"
import { defaultOption } from "../../types"

const EditorSetting: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { option, setOption } = useContext(EditorContext)

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
              <FormLabel>줄 높이: {option.lineHeight}px</FormLabel>
              <Slider
                aria-label="slider-ex-1"
                defaultValue={option.lineHeight}
                value={option.lineHeight}
                onChange={(value: number) =>
                  setOption({ ...option, lineHeight: value })
                }
                min={12}
                max={56}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>행 간격: {option.gap}px</FormLabel>
              <Slider
                aria-label="slider-ex-1"
                defaultValue={option.gap}
                value={option.gap}
                onChange={(value: number) =>
                  setOption({ ...option, gap: value })
                }
                min={0}
                max={16}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>글자 크기: {option.fontSize}px</FormLabel>
              <Slider
                aria-label="slider-ex-1"
                defaultValue={option.fontSize}
                value={option.fontSize}
                onChange={(value: number) =>
                  setOption({ ...option, fontSize: value })
                }
                min={6}
                max={32}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </FormControl>
            <FormControl>
              <FormLabel>들여쓰기: {option.indent}em</FormLabel>
              <Slider
                aria-label="slider-ex-1"
                defaultValue={option.indent}
                value={option.indent}
                onChange={(value: number) =>
                  setOption({ ...option, indent: value })
                }
                min={0}
                max={4}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              variant={"outline"}
              mr={3}
              onClick={() => setOption(defaultOption)}
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
