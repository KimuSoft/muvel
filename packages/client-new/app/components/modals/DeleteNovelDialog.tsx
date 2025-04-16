import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Portal,
} from "@chakra-ui/react"
import { useNavigate, useRevalidator } from "react-router"
import { TbTrash } from "react-icons/tb"
import React from "react"
import { api } from "~/utils/api"
import { toaster } from "~/components/ui/toaster"

type DeleteNovelDialogProps = {
  novelId: string
  children?: React.ReactNode
}

const DeleteNovelDialog: React.FC<DeleteNovelDialogProps> = ({
  novelId,
  children,
}) => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(false)
  const { revalidate } = useRevalidator()

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      await api.delete(`/novels/${novelId}`)
      toaster.create({
        title: "소설이 삭제되었어요...",
      })
      await revalidate()
      // onOpenChange({ open: false })
      navigate("/")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <DialogHeader>
              <DialogTitle display="flex" gap={2} alignItems="center">
                <TbTrash />
                소설 삭제하기
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              삭제한 소설은 되돌릴 수 없어요. 정말로 삭제하시겠어요?
            </DialogBody>
            <DialogFooter gap={2} justifyContent="flex-end">
              <Dialog.CloseTrigger asChild>
                <Button loading={isLoading}>취소</Button>
              </Dialog.CloseTrigger>
              <Button
                colorScheme="red"
                loading={isLoading}
                onClick={handleDelete}
              >
                <TbTrash />
                네, 삭제할게요
              </Button>
            </DialogFooter>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default DeleteNovelDialog
