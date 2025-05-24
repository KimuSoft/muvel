import {
  Center,
  CloseButton,
  Drawer,
  EmptyState,
  Field,
  HStack,
  Icon,
  Spinner,
  Stack,
  useDialog,
  type UseDialogReturn,
  VStack,
} from "@chakra-ui/react"
import React, { useEffect } from "react"
import { type EpisodeSnapshot } from "muvel-api-types"
import { TbHistory, TbSlash } from "react-icons/tb"
import type { EpisodeData } from "~/providers/EpisodeProvider"
import { getEpisodeSnapshots } from "~/services/episodeSnapshotService"
import { FaInfoCircle } from "react-icons/fa"
import SnapshotItem from "~/features/novel-editor/components/SnapshotItem"
import SnapshotDiffDialog from "~/features/novel-editor/components/dialogs/SnapshotDiffDialog"

const SnapshotDrawer: React.FC<{
  episode: EpisodeData
  children?: React.ReactNode
  dialog: UseDialogReturn
}> = ({ episode, children, dialog }) => {
  const [snapshots, setSnapshots] = React.useState<EpisodeSnapshot[]>([])
  const [currentSnapshot, setCurrentSnapshot] =
    React.useState<EpisodeSnapshot | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const diffDialog = useDialog()

  const fetchSnapshots = async () => {
    setIsLoading(true)
    const snapshots = await getEpisodeSnapshots(episode.id)

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
    <Drawer.RootProvider value={dialog} placement={"end"}>
      {children && <Drawer.Trigger asChild>{children}</Drawer.Trigger>}
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.CloseTrigger asChild>
            <CloseButton position="absolute" top="4" right="4" />
          </Drawer.CloseTrigger>
          <Drawer.Header>
            <Drawer.Title>
              <Icon as={TbHistory} color={"purple.500"} mr={3} />
              버전 관리
            </Drawer.Title>
          </Drawer.Header>

          <Drawer.Body pt={0}>
            <Field.Root mb={3}>
              <HStack color={"purple.500"}>
                <FaInfoCircle />
                <Field.HelperText>
                  Ctrl + S로 직접 버전을 생성할 수도 있어요.
                </Field.HelperText>
              </HStack>
            </Field.Root>
            {currentSnapshot && dialog.open && (
              <SnapshotDiffDialog
                dialog={diffDialog}
                snapshot={currentSnapshot}
              />
            )}
            <Stack mb={5} gap={1}>
              {isLoading ? (
                <Center w={"100%"} h={300}>
                  <Spinner />
                </Center>
              ) : snapshots.length ? (
                snapshots.map((snapshot) => (
                  <SnapshotItem
                    key={`snapshot-${snapshot.id}`}
                    snapshot={snapshot}
                    onClick={() => {
                      setCurrentSnapshot(snapshot)
                      diffDialog.setOpen(true)
                    }}
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
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.RootProvider>
  )
}

export default SnapshotDrawer
