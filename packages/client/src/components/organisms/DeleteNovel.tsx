import React from "react"
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react"
import { AiTwotoneDelete } from "react-icons/ai"
import { toast } from "react-toastify"
import { api } from "../../utils/api"
import { useNavigate } from "react-router-dom"
import { TbTrash } from "react-icons/tb"

const DeleteNovel: React.FC<{ novelId: string }> = ({ novelId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = React.useState(false)

  const onClick = async () => {
    setIsLoading(true)
    await api.delete(`/novels/${novelId}`)
    toast.info("소설이 삭제되었어요...")
    onClose()
    setIsLoading(false)
    navigate("/novels")
  }

  return (
    <>
      <Button onClick={onOpen} colorScheme="red">
        <TbTrash style={{ marginRight: 10 }} /> 소설 삭제
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>정말로 삭제하실 거예요?!</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            삭제한 소설은 다시 되돌릴 수 없어요! 그래도 삭제하실 건가요?
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              isLoading={isLoading}
              onClick={onClick}
            >
              <AiTwotoneDelete style={{ marginRight: 10 }} />네 삭제할게요
            </Button>
            <Button onClick={onClose}>취소</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default DeleteNovel
