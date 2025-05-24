import React, { useMemo } from "react"
import { HStack, Stack, Tag, Text } from "@chakra-ui/react"
import { type EpisodeSnapshot, SnapshotReason } from "muvel-api-types"
import { getTimeAgoKo } from "~/utils/getTimeAgoKo"
import { Tooltip } from "~/components/ui/tooltip"

const SnapshotItem: React.FC<{
  snapshot: EpisodeSnapshot
  onClick?: () => void
}> = ({ snapshot, onClick }) => {
  const reasonTag = useMemo(() => {
    switch (snapshot.reason) {
      case SnapshotReason.Manual:
        return (
          <Tag.Root variant={"outline"} colorPalette={"green"} size={"sm"}>
            <Tag.Label>수동 생성</Tag.Label>
          </Tag.Root>
        )
      case SnapshotReason.Autosave:
        return (
          <Tag.Root variant={"outline"} colorPalette={"purple"} size={"sm"}>
            <Tag.Label>자동 생성</Tag.Label>
          </Tag.Root>
        )
      case SnapshotReason.Merge:
        return (
          <Tag.Root variant={"outline"} colorPalette={"yellow"} size={"sm"}>
            <Tag.Label>병합 전 백업</Tag.Label>
          </Tag.Root>
        )
    }
  }, [snapshot.reason])

  return (
    <Stack
      gap={2}
      borderWidth={1}
      borderColor={"gray.500"}
      cursor={"pointer"}
      borderRadius={"md"}
      onClick={onClick}
      p={3}
    >
      <HStack>
        <Tooltip
          content={`${new Date(snapshot.createdAt).toLocaleDateString()} (${new Date(snapshot.createdAt).toLocaleTimeString()})`}
          openDelay={200}
        >
          <Text fontWeight={"bold"}>
            {getTimeAgoKo(new Date(snapshot.createdAt))}
          </Text>
        </Tooltip>
        <Text color={"gray.500"} fontSize={"sm"}>
          {snapshot.blocks
            .map((b) => b.text.length)
            .reduce((acc, cur) => acc + cur)
            .toLocaleString()}
          자
        </Text>
        {reasonTag}
      </HStack>
    </Stack>
  )
}

export default SnapshotItem
