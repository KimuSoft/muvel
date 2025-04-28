import React, { useMemo } from "react"
import { Box, type BoxProps } from "@chakra-ui/react"
import { Tooltip } from "~/components/ui/tooltip"

export enum SyncState {
  Waiting = "waiting",
  Syncing = "syncing",
  Synced = "synced",
  Error = "error",
}

const SyncIndicator: React.FC<BoxProps & { state: SyncState }> = ({
  state,
  ...props
}) => {
  const { color, label } = useMemo(() => {
    switch (state) {
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
  }, [state])

  return (
    <Tooltip content={label} openDelay={0}>
      <Box
        w={2}
        h={2}
        rounded={"full"}
        bgColor={color}
        cursor={"pointer"}
        transition={"background-color 0.2s ease-in-out"}
        {...props}
      />
    </Tooltip>
  )
}

export default SyncIndicator
