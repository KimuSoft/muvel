import { useEffect, useState } from "react"
import { Button, FileUpload, VStack } from "@chakra-ui/react"
import { HiClipboard, HiUpload } from "react-icons/hi"
import { useImageUpload } from "~/hooks/useImageUpload"

interface ImageUploaderProps {
  onUploaded: (url: string) => void
}

const ImageUploader = ({ onUploaded }: ImageUploaderProps) => {
  const { uploadFile, loading } = useImageUpload(onUploaded)
  const [clipboardAvailable, setClipboardAvailable] = useState(false)
  const [fileFromClipboard, setFileFromClipboard] = useState<File | null>(null)

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items
      if (!items) return

      let hasImage = false
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          hasImage = true
          const file = item.getAsFile()
          if (file) {
            setFileFromClipboard(file)
          }
        }
      }

      setClipboardAvailable(hasImage)
    }

    document.addEventListener("paste", handlePaste)
    return () => {
      document.removeEventListener("paste", handlePaste)
    }
  }, [uploadFile])

  return (
    <VStack alignItems="flex-start">
      <FileUpload.Root
        maxFiles={1}
        onFileAccept={(f) => uploadFile(f.files[0])}
        accept={["image/*"]}
      >
        <FileUpload.HiddenInput />
        <FileUpload.List />
        <FileUpload.Trigger asChild>
          <Button variant="outline" size="xs" loading={loading}>
            <HiUpload /> 컴퓨터에서 이미지 업로드
          </Button>
        </FileUpload.Trigger>
      </FileUpload.Root>
      <Button
        variant="outline"
        size="xs"
        disabled={!clipboardAvailable}
        loading={loading}
        onClick={() => {
          if (fileFromClipboard) {
            void uploadFile(fileFromClipboard)
          }
        }}
      >
        <HiClipboard />
        클립보드에서 붙여넣기 (Ctrl+V)
      </Button>
    </VStack>
  )
}

export default ImageUploader
