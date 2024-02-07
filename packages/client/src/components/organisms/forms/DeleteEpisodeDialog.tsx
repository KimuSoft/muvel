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
import { toast } from "react-toastify"
import { api } from "../../../utils/api"
import { useNavigate } from "react-router-dom"
import { Novel } from "../../../types/novel.type"
import { TbTrash } from "react-icons/tb"

const DeleteEpisodeDialog: React.FC<{ novel: Novel; episodeId: string }> = ({
  novel,
  episodeId,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = React.useState(false)

  const onClick = async () => {
    setIsLoading(true)
    await api.delete(`/episodes/${episodeId}`)
    toast.info("에피소드가 삭제되었어요...")
    onClose()
    setIsLoading(false)
    navigate(`/novels/${novel.id}`)
  }

  return (
    <>
      {novel?.episodeIds?.length > 1 ? (
        <Button onClick={onOpen} colorScheme="red">
          <TbTrash style={{ marginRight: 10 }} /> 에피소드 삭제
        </Button>
      ) : null}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>정말로 삭제하실 거예요?!</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            에피소드를 삭제하면 다시 되돌릴 수 없어요! 그래도 삭제하실 건가요?
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              isLoading={isLoading}
              onClick={onClick}
            >
              <TbTrash style={{ marginRight: 10 }} />네 삭제할게요
            </Button>
            <Button onClick={onClose}>취소</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default DeleteEpisodeDialog
