import React from "react"
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from "@chakra-ui/react"
import SortableEpisodeList from "../SortableEpisodeList"
import { Novel } from "../../../types/novel.type"

const SortEpisodeModal: React.FC<
  Omit<ModalProps, "children"> & { novel: Novel; onSort(): Promise<unknown> }
> = ({ novel, onSort, ...props }) => {
  return (
    <Modal {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>에피소드 순서 바꾸기</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SortableEpisodeList novel={novel} onChange={onSort} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default SortEpisodeModal
