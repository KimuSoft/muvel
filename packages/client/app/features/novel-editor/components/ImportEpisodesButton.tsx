import React, { useRef, useState } from "react"
import { Button, Tag, type ButtonProps } from "@chakra-ui/react"
import { importEpisodes } from "~/services/ioService"
import { toaster } from "~/components/ui/toaster"
import type { LineBreakImportStrategy } from "~/types/options"
import { useEditorStyleOptions } from "~/hooks/useAppOptions"
import { FaFileImport } from "react-icons/fa6"

interface ImportEpisodesButtonProps extends ButtonProps {
  novelId: string
  onImportComplete?: (
    results: Array<{
      fileName: string
      success: boolean
      episodeId?: string
      error?: string
    }>,
  ) => void
  lineBreakStrategy?: LineBreakImportStrategy
  buttonText?: string
}

export const ImportEpisodesButton: React.FC<ImportEpisodesButtonProps> = ({
  novelId,
  onImportComplete,
  buttonText = "에피소드 가져오기",
  ...restButtonProps
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [options] = useEditorStyleOptions()

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files
    if (!files || files.length === 0) {
      return
    }

    const filesArray = Array.from(files)
    setIsImporting(true)

    const promise = importEpisodes(
      novelId,
      filesArray,
      options.lineBreakImportStrategy,
    )

    toaster.promise(promise, {
      loading: {
        title: "에피소드 가져오는 중...",
        description: "선택한 파일들을 처리하고 있습니다. 잠시만 기다려주세요.",
      },
      success: (results) => {
        setIsImporting(false)
        const successfulCount = results.filter((r) => r.success).length
        const failedCount = results.length - successfulCount

        if (onImportComplete) {
          onImportComplete(results)
        }

        if (failedCount === 0) {
          return {
            title: "가져오기 성공!",
            description: `총 ${results.length}개의 파일을 모두 성공적으로 가져왔습니다.`,
          }
        } else if (successfulCount > 0) {
          return {
            title: "일부 파일 가져오기 완료",
            description: `총 ${results.length}개 중 ${successfulCount}개 성공, ${failedCount}개 실패. 자세한 내용은 콘솔을 확인하세요.`,
          }
        } else {
          return {
            title: "가져오기 실패",
            description: `총 ${results.length}개의 파일을 가져오지 못했습니다. 자세한 내용은 콘솔을 확인하세요.`,
          }
        }
      },
      error: (err) => {
        setIsImporting(false)
        if (onImportComplete) {
          onImportComplete([]) // Or pass error information
        }
        return {
          title: "가져오기 중 오류 발생",
          description:
            (err as Error).message ||
            "알 수 없는 오류가 발생했습니다. 다시 시도해주세요.",
        }
      },
    })

    // Reset the input value to allow selecting the same file again
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileSelect}
        multiple
        accept=".txt,.md" // Initially only .txt, can be expanded e.g., ".txt,.md,.docx"
        style={{ display: "none" }}
      />
      <Button
        onClick={handleClick}
        loading={isImporting}
        variant="outline"
        size="sm"
        {...restButtonProps}
      >
        <FaFileImport />
        {buttonText}
        <Tag.Root colorPalette={"purple"}>
          <Tag.Label>BETA</Tag.Label>
        </Tag.Root>
      </Button>
    </>
  )
}
