import React from "react"
import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react"
import { api } from "~/utils/api"
import { useNavigate } from "react-router"
import type { GetNovelResponseDto } from "muvel-api-types"
import { TbTrash } from "react-icons/tb"
import { toaster } from "~/components/ui/toaster"
import type { GetLocalNovelDetailsResponse } from "~/services/tauri/types"

const DeleteEpisodeDialog: React.FC<{
  novel: GetNovelResponseDto | GetLocalNovelDetailsResponse
  episodeId: string
}> = ({ novel, episodeId }) => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(false)

  const onClick = async () => {
    setIsLoading(true)
    await api.delete(`/episodes/${episodeId}`)
    toaster.info({ title: "에피소드가 삭제되었어요..." })
    setIsLoading(false)
    navigate(`/novels/${novel.id}`)
  }

  if (!novel?.episodes.length || novel.episodes.length <= 1) return null

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button colorPalette="red" variant={"outline"}>
          <TbTrash style={{ marginRight: 10 }} /> 에피소드 삭제
        </Button>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>정말로 삭제하실 거예요?!</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton position="absolute" right="3" top="3" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              에피소드를 삭제하면 다시 되돌릴 수 없어요! 그래도 삭제하실 건가요?
            </Dialog.Body>

            <Dialog.Footer>
              <Button
                colorPalette="red"
                mr={3}
                loading={isLoading}
                onClick={onClick}
              >
                <TbTrash />
                주의사항을 이해하였고 삭제하겠습니다
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default DeleteEpisodeDialog
