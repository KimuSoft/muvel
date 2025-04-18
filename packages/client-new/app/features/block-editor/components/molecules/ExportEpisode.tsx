import React, { useMemo } from "react"
import {
  Button,
  FormLabel,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react"
import { FaCopy, FaFileExport, FaSave } from "react-icons/fa"
import { useBlockEditor } from "~/features/block-editor/context/EditorContext"
import { toaster } from "~/components/ui/toaster"
import blocksToText from "~/features/block-editor/utils/blocksToText"
import { Tooltip } from "~/components/ui/tooltip"

const ExportEpisode: React.FC = () => {
  const { blocks, episode } = useBlockEditor()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const initialRef = React.useRef(null)

  const onSubmit = async () => {
    saveToTxtFile()
  }

  // const saveToMvlFile = () => {
  //   const json = JSON.stringify(episode)
  //   const blob = new Blob([json], { type: "application/json" })
  //   const href = URL.createObjectURL(blob)
  //   const link = document.createElement("a")
  //   link.href = href
  //   link.download = "export.json"
  //
  //   document.body.appendChild(link)
  //   link.click()
  //   document.body.removeChild(link)
  //   toaster.success({
  //     title: "성공적으로 저장했어요!",
  //   })
  // }

  const saveToTxtFile = () => {
    const text = blocksToText(blocks)
    const blob = new Blob([text], { type: "text/plain" })
    const href = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = href
    link.download = `${episode.title}.txt`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toaster.success({
      title: "성공적으로 저장했어요!",
    })
  }

  const onCopyToClipboard = () => {
    // 미리보기를 클립보드에 저장
    navigator.clipboard.writeText(preview).then()
    toaster.success({
      title: "클립보드에 복사했어요!",
    })
  }

  const preview = useMemo(() => blocksToText(blocks), [blocks])

  return (
    <>
      <Tooltip content="이 에피소드 내보내기">
        <IconButton aria-label={"Export"} variant="outline" onClick={onOpen}>
          <FaFileExport size={20} />
        </IconButton>
      </Tooltip>

      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>에피소드를 텍스트로 내보내기</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormLabel>미리보기</FormLabel>
            <Textarea defaultValue={preview} mb={3} h="50vh" />
            <Text color="gray.500">
              공백 제외 {preview.replace(/\s/g, "").length}자, 공백 포함{" "}
              {preview.length}자
            </Text>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button onClick={onClose}>취소</Button>
            <Button colorScheme="purple" onClick={onCopyToClipboard}>
              <FaCopy size={15} style={{ marginRight: 10 }} />
              복사하기
            </Button>
            <Button colorScheme="blue" type="submit" onClick={onSubmit}>
              <FaSave size={15} style={{ marginRight: 10 }} />
              저장하기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ExportEpisode
