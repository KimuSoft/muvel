import {
  CloseButton,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerPositioner,
  DrawerRootProvider,
  DrawerTrigger,
  EmptyState,
  Heading,
  HStack,
  Stack,
  Tag,
  Text,
  type UseDialogReturn,
  VStack,
} from "@chakra-ui/react"
import React, { useEffect } from "react"
import { SnapshotReason, type EpisodeSnapshot } from "muvel-api-types"
import { getCloudSnapshots } from "~/services/api/api.episode"
import { TbHistory, TbSlash } from "react-icons/tb"
import { toaster } from "~/components/ui/toaster"
import type { EpisodeData } from "~/features/novel-editor/context/EditorContext"

const SnapshotItem: React.FC<{
  snapshot: EpisodeSnapshot
}> = ({ snapshot }) => {
  const handleCopy = () => {
    navigator.clipboard
      .writeText(snapshot.blocks.map((e) => e.text).join("\n\n"))
      .then(() => {
        toaster.success({
          title: "해당 버전의 내용이 클립보드에 복사되었어요!",
          description: "이 기능은 임시이고, 추후 개선될 예정이에요.",
        })
      })
  }

  return (
    <Stack
      gap={2}
      borderWidth={1}
      borderColor={"gray.500"}
      cursor={"pointer"}
      borderRadius={"md"}
      onClick={handleCopy}
      p={3}
    >
      <HStack>
        <Text fontWeight={"bold"}>
          {new Date(snapshot.createdAt).toLocaleDateString()} (
          {new Date(snapshot.createdAt).toLocaleTimeString()})
        </Text>
        <Text color={"gray.500"} fontSize={"sm"}>
          {snapshot.blocks
            .map((b) => b.text.length)
            .reduce((acc, cur) => acc + cur)}
          자
        </Text>
        <Tag.Root
          variant={"outline"}
          colorPalette={
            snapshot.reason === SnapshotReason.Autosave ? "purple" : "yellow"
          }
          size={"sm"}
        >
          <Tag.Label>
            {snapshot.reason === SnapshotReason.Autosave
              ? "자동 생성"
              : "병합 전 백업"}
          </Tag.Label>
        </Tag.Root>
      </HStack>
    </Stack>
  )
}

const SnapshotDrawer: React.FC<{
  episode: EpisodeData
  children?: React.ReactNode
  dialog: UseDialogReturn
}> = ({ episode, children, dialog }) => {
  const [snapshots, setSnapshots] = React.useState<EpisodeSnapshot[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const fetchSnapshots = async () => {
    setIsLoading(true)
    const snapshots = await getCloudSnapshots(episode.id)

    // ai 결과를 최신순으로 정렬 ai.createdAt: string
    snapshots.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    setSnapshots(snapshots)

    setIsLoading(false)
  }

  useEffect(() => {
    if (!dialog.open) return
    void fetchSnapshots()
  }, [dialog.open])

  return (
    <DrawerRootProvider value={dialog} placement={"end"} size={"md"}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
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
              <Tag.Root variant={"solid"} colorPalette={"purple"}>
                <Tag.Label>베타</Tag.Label>
              </Tag.Root>
            </HStack>
          </DrawerHeader>

          <DrawerBody>
            <Stack gap={3}>
              <Stack mb={5}>
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
    </DrawerRootProvider>
  )
}

export default SnapshotDrawer
