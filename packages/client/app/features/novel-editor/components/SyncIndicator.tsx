import React, { useMemo } from "react"
import { Box, type BoxProps, Center } from "@chakra-ui/react"
import { Tooltip } from "~/components/ui/tooltip"
import { useEpisodeContext } from "~/providers/EpisodeProvider"

export enum SyncState {
  Waiting = "waiting",
  Syncing = "syncing",
  Synced = "synced",
  Error = "error",
}

const SyncIndicator: React.FC<BoxProps> = (props) => {
  const { syncState } = useEpisodeContext()

  const { color, label } = useMemo(() => {
    switch (syncState) {
      case SyncState.Waiting:
        return {
          color: "gray.300",
          label: "사용자의 입력이 끝나기를 대기하고 있어요...",
        }
      case SyncState.Syncing:
        return { color: "blue.500", label: "변경 사항을 저장하는 중이에요..." }
      case SyncState.Synced:
        return { color: "green.500", label: "문서가 최신 상태예요!" }
      case SyncState.Error:
        return { color: "red.500", label: "동기화에 오류가 발생했어요..." }
    }
  }, [syncState])

  return (
    <Tooltip content={label} openDelay={100}>
      <Center w={10} h={10}>
        <Box
          w={"7px"}
          h={"7px"}
          rounded={"full"}
          bgColor={color}
          cursor={"pointer"}
          transition={"background-color 0.2s ease-in-out"}
          {...props}
        />
      </Center>
    </Tooltip>
  )
}

export default SyncIndicator
