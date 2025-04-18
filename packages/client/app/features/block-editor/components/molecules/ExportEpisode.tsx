import React, { useMemo, useRef, useState } from "react"
import {
  Button,
  IconButton,
  Text,
  Textarea,
  Dialog,
  Portal,
  CloseButton,
  HStack,
  Field,
} from "@chakra-ui/react"
import { FaCopy, FaFileExport, FaSave } from "react-icons/fa"
import { useBlockEditor } from "~/features/block-editor/context/EditorContext"
import { toaster } from "~/components/ui/toaster"
import blocksToText from "~/features/block-editor/utils/blocksToText"
import { Tooltip } from "~/components/ui/tooltip"

const ExportEpisode: React.FC = () => {
  const { blocks, episode } = useBlockEditor()
  const [open, setOpen] = useState(false)

  const preview = useMemo(() => blocksToText(blocks), [blocks])
  const initialRef = useRef<HTMLTextAreaElement>(null)

  const onSubmit = () => {
    const text = blocksToText(blocks)
    const blob = new Blob([text], { type: "text/plain" })
    const href = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = href
    link.download = `${episode.title}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toaster.success({ title: "성공적으로 저장했어요!" })
  }

  const onCopyToClipboard = () => {
    navigator.clipboard.writeText(preview).then(() => {
      toaster.success({ title: "클립보드에 복사했어요!" })
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={(detail) => setOpen(detail.open)}>
      <Dialog.Trigger asChild>
        <Tooltip content="이 에피소드 내보내기">
          <IconButton aria-label="Export" variant="outline">
            <FaFileExport size={20} />
          </IconButton>
        </Tooltip>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Text fontSize="xl" fontWeight="bold">
                에피소드를 텍스트로 내보내기
              </Text>
              <Dialog.CloseTrigger asChild>
                <CloseButton position="absolute" right="3" top="3" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <Field.Root>
                <Field.Label htmlFor="preview">미리보기</Field.Label>
                <Textarea
                  id="preview"
                  defaultValue={preview}
                  mb={3}
                  h="50vh"
                  ref={initialRef}
                />
              </Field.Root>

              <Text color="gray.500" mt={2}>
                공백 제외 {preview.replace(/\s/g, "").length}자, 공백 포함{" "}
                {preview.length}자
              </Text>
            </Dialog.Body>

            <Dialog.Footer>
              <HStack gap={3} w="100%" justify="flex-end">
                <Button onClick={() => setOpen(false)}>취소</Button>
                <Button colorScheme="purple" onClick={onCopyToClipboard}>
                  <FaCopy size={15} style={{ marginRight: 10 }} />
                  복사하기
                </Button>
                <Button colorScheme="blue" onClick={onSubmit}>
                  <FaSave size={15} style={{ marginRight: 10 }} />
                  저장하기
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default ExportEpisode
