import React from "react"
import {
  Box,
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
  Tooltip,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react"
import { defaultOption } from "../../../types"
import { AiFillSetting } from "react-icons/ai"
import { useRecoilState } from "recoil"
import { editorOptionsState } from "../../../recoil/editor"
import { sampleBlock } from "../../../types/block.type"
import ContentEditableBlock from "../../atoms/editor/MuvelBlock/ContentEditableBlock"

const EditorSetting: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [options, setOptions] = useRecoilState(editorOptionsState)

  return (
    <>
      <Tooltip label={"에디터 디자인 설정하기"} openDelay={500}>
        <IconButton
          aria-label={"에디터 설정"}
          icon={<AiFillSetting />}
          onClick={onOpen}
          variant={"outline"}
        />
      </Tooltip>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>에디터 설정하기</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={7}>
              <FormLabel>블록 미리보기</FormLabel>
              <Box w="100%" bgColor={useColorModeValue("gray.100", "gray.800")}>
                <ContentEditableBlock
                  block={sampleBlock}
                  position={-7}
                  disabled
                />
              </Box>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>줄 높이: {options.lineHeight}px</FormLabel>
              <Slider
                aria-label="slider-ex-1"
                defaultValue={options.lineHeight}
                value={options.lineHeight}
                onChange={(value: number) =>
                  setOptions({ ...options, lineHeight: value })
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
              <FormLabel>행 간격: {options.gap}px</FormLabel>
              <Slider
                aria-label="slider-ex-1"
                defaultValue={options.gap}
                value={options.gap}
                onChange={(value: number) =>
                  setOptions({ ...options, gap: value })
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
              <FormLabel>글자 크기: {options.fontSize}px</FormLabel>
              <Slider
                aria-label="slider-ex-1"
                defaultValue={options.fontSize}
                value={options.fontSize}
                onChange={(value: number) =>
                  setOptions({ ...options, fontSize: value })
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
              <FormLabel>들여쓰기: {options.indent}em</FormLabel>
              <Slider
                aria-label="slider-ex-1"
                defaultValue={options.indent}
                value={options.indent}
                onChange={(value: number) =>
                  setOptions({ ...options, indent: value })
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
