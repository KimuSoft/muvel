import React from "react"
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogProps,
  Button,
  useToast,
} from "@chakra-ui/react"
import { AiTwotoneDelete } from "react-icons/ai"
import { api } from "../../../utils/api"
import { useNavigate } from "react-router-dom"
import { TbTrash } from "react-icons/tb"

const DeleteNovelDialog: React.FC<
  { novelId: string } & Omit<
    AlertDialogProps,
    "leastDestructiveRef" | "children"
  >
> = ({ novelId, ...props }) => {
  const navigate = useNavigate()
  const toast = useToast()

  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const [isLoading, setIsLoading] = React.useState(false)

  const onClick = async () => {
    setIsLoading(true)
    await api.delete(`/novels/${novelId}`)
    toast({
      title: "소설이 삭제되었어요...",
      status: "info",
    })
    props.onClose()
    setIsLoading(false)
    navigate("/")
  }

  return (
    <AlertDialog leastDestructiveRef={cancelRef} {...props}>
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader
          display={"flex"}
          flexDir={"row"}
          alignItems={"center"}
          gap={3}
        >
          <TbTrash />
          소설 삭제하기
        </AlertDialogHeader>
        <AlertDialogBody>
          삭제한 소설은 다시 되돌릴 수 없어요! 그래도 삭제하실 건가요?
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button
            colorScheme="red"
            mr={3}
            isLoading={isLoading}
            onClick={onClick}
          >
            <TbTrash style={{ marginRight: 10 }} />네 삭제할게요!
          </Button>
          <Button isLoading={isLoading} ref={cancelRef} onClick={props.onClose}>
            취소
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteNovelDialog
