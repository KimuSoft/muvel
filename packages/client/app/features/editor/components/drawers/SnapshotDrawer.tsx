import {
  CloseButton,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerTrigger,
  EmptyState,
  Heading,
  HStack,
  Stack,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react"
import React, { type PropsWithChildren, useEffect } from "react"
import type { EpisodeSnapshot, GetEpisodeResponseDto } from "muvel-api-types"
import { getSnapshots } from "~/api/api.episode"
import { TbHistory, TbSlash } from "react-icons/tb"

const SnapshotItem: React.FC<{
  snapshot: EpisodeSnapshot
}> = ({ snapshot }) => {
  return (
    <Stack
      gap={2}
      borderWidth={1}
      borderColor={"gray.500"}
      cursor={"pointer"}
      borderRadius={"md"}
      p={3}
    >
      <HStack>
        <Text fontWeight={"bold"}>
          {snapshot.createdAt.toLocaleDateString()} (
          {snapshot.createdAt.toLocaleTimeString()})
        </Text>
        <Tag.Root variant={"solid"} colorPalette={"purple"} size={"sm"}>
          <Tag.Label>자동 생성</Tag.Label>
        </Tag.Root>
      </HStack>
    </Stack>
  )
}

const SnapshotDrawer: React.FC<
  {
    episode: GetEpisodeResponseDto
  } & PropsWithChildren
> = ({ episode, children }) => {
  const [snapshots, setSnapshots] = React.useState<EpisodeSnapshot[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const fetchSnapshots = async () => {
    setIsLoading(true)
    const snapshots = await getSnapshots(episode.id)

    // string date를 Date로 변경 (createdAt)
    snapshots.forEach((snapshot) => {
      snapshot.createdAt = new Date(snapshot.createdAt.toString())
    })

    // ai 결과를 최신순으로 정렬 ai.createdAt: string
    snapshots.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime()
    })

    setSnapshots(snapshots)

    setIsLoading(false)
  }

  useEffect(() => {
    void fetchSnapshots()
  }, [])

  return (
    <DrawerRoot
      placement={"end"}
      size={"md"}
      onOpenChange={(open) => {
        if (open.open) void fetchSnapshots()
      }}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent>
          <DrawerCloseTrigger asChild>
            <CloseButton position="absolute" top="4" right="4" />
          </DrawerCloseTrigger>
          <DrawerHeader>
            <HStack gap={3} mb={3}>
              <TbHistory size={"24px"} />
              <Heading size={"lg"}>버전 관리</Heading>
            </HStack>
          </DrawerHeader>

          <DrawerBody>
            <Stack gap={3}>
              <Stack gap={5} mb={5}>
                {snapshots.length ? (
                  snapshots.map((snapshot) => (
                    <SnapshotItem
                      key={`snapshot-${snapshot.id}`}
                      snapshot={snapshot}
                    />
                  ))
                ) : (
                  <EmptyState.Root>
                    <EmptyState.Content>
                      <VStack textAlign="center">
                        <EmptyState.Indicator>
                          <TbSlash />
                        </EmptyState.Indicator>
                        <VStack mt={3}>
                          <EmptyState.Title>
                            아직 만들어진 백업이 없어요!
                          </EmptyState.Title>
                          <EmptyState.Description>
                            수정이 생기고 10분마다 자동으로 생성되니, 걱정하지
                            마세요.
                          </EmptyState.Description>
                        </VStack>
                      </VStack>
                    </EmptyState.Content>
                  </EmptyState.Root>
                )}
              </Stack>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRoot>
  )
}

export default SnapshotDrawer
