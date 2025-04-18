import { ClipboardLabel, ClipboardRoot, Image } from "@chakra-ui/react"
import React from "react"
import ImageUploader from "~/components/molecules/ImageUploader"

const KimuageField: React.FC<{
  value?: string
  onChange: (url: string) => void
}> = ({ value, onChange }) => {
  return (
    <ClipboardRoot value={value || ""} mb={3}>
      <ImageUploader onUploaded={onChange} />
    </ClipboardRoot>
  )
}

export default React.memo(KimuageField)
