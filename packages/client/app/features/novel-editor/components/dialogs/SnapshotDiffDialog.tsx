import {
  Button,
  Dialog,
  HStack,
  Icon,
  Stack,
  Text,
  type UseDialogReturn,
} from "@chakra-ui/react"
import React, { useMemo } from "react"
import { type EpisodeSnapshot } from "muvel-api-types"
import { toaster } from "~/components/ui/toaster"
import { TbCopy, TbDownload } from "react-icons/tb"
import { diff_match_patch as diffMatchPatch } from "diff-match-patch"
import { blocksToText, pmNodeToText } from "~/services/io/txt/pmNodeToText"
import { useExportSettingOptions } from "~/hooks/useAppOptions"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"
import { LuGitCompareArrows } from "react-icons/lu"

interface SnapshotDiffDialogProps {
  snapshot: EpisodeSnapshot
  dialog: UseDialogReturn
}

type DiffOperation = [number, string]

const DiffView: React.FC<{ diffs: DiffOperation[] }> = ({ diffs }) => {
  return (
    <Stack
      p={2}
      borderWidth={1}
      borderRadius="md"
      borderColor="gray.200"
      bg="gray.50"
      fontSize="sm"
      whiteSpace="pre-wrap"
      overflow="auto"
      maxH="400px"
    >
      {diffs.map((diff, i) => {
        const [operation, text] = diff
        let bg = "transparent"
        if (operation === -1) bg = "red.100"
        if (operation === 1) bg = "green.100"

        return (
          <Text
            as="span"
            key={i}
            bg={bg}
            borderRadius="md"
            color={
              operation === 0
                ? "gray.800"
                : operation === -1
                  ? "red.800"
                  : "green.800"
            }
          >
            {text}
          </Text>
        )
      })}
    </Stack>
  )
}

const SnapshotDiffDialog: React.FC<SnapshotDiffDialogProps> = ({
  snapshot,
  dialog,
}) => {
  const [exportOptions] = useExportSettingOptions()
  const { view } = useEditorContext()

  const snapshotText = useMemo(() => {
    return blocksToText(snapshot.blocks, exportOptions)
  }, [snapshot])

  const currentDocumentText = useMemo(() => {
    if (!dialog.open || !view?.state) return ""
    return pmNodeToText(view.state.doc, exportOptions)
  }, [dialog.open, view?.state])

  const diffs = useMemo(() => {
    const dmp = new diffMatchPatch()
    const diff = dmp.diff_main(snapshotText, currentDocumentText)
    dmp.diff_cleanupSemantic(diff)
    return diff
  }, [snapshotText, currentDocumentText])

  const handleCopy = () => {
    navigator.clipboard.writeText(snapshotText).then(() => {
      toaster.success({
        title: "해당 버전의 내용이 클립보드에 복사되었어요!",
      })
    })
  }

  const handleDownload = () => {
    // 스냅숏 내용을 파일로 다운로드
    const blob = new Blob([snapshotText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `스냅숏_${new Date(snapshot.createdAt).toLocaleDateString()}_${new Date(
      snapshot.createdAt,
    ).toLocaleTimeString()}.txt`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toaster.success({
      title: "해당 버전의 내용이 다운로드되었어요!",
    })
  }

  return (
    <Dialog.RootProvider value={dialog}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              <Icon color={"purple.500"} mr={3}>
                <LuGitCompareArrows />
              </Icon>
              버전 비교
            </Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>
          <Dialog.Body>
            <Stack>
              <Text>
                <strong>스냅숏 시간:</strong>{" "}
                {new Date(snapshot.createdAt).toLocaleDateString()} (
                {new Date(snapshot.createdAt).toLocaleTimeString()})
              </Text>
              <Text>
                <strong>글자 수:</strong>{" "}
                {snapshot.blocks
                  .map((b) => b.text.length)
                  .reduce((acc, cur) => acc + cur)}
                자
              </Text>
              <Text mt={3} fontWeight="bold">
                해당 버전부터 현재까지의 변경사항
              </Text>
              <DiffView diffs={diffs} />
            </Stack>
          </Dialog.Body>
          <Dialog.Footer>
            <HStack>
              <Button
                onClick={handleCopy}
                variant="outline"
                colorPalette="purple"
              >
                <TbCopy />
                스냅숏 복사
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                colorPalette="blue"
              >
                <TbDownload />
                스냅숏 다운로드
              </Button>
              <Button onClick={() => dialog.setOpen(false)}>닫기</Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.RootProvider>
  )
}

export default SnapshotDiffDialog
