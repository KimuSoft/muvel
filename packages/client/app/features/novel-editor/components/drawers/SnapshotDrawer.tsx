import {
  Center,
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
  Field,
  Heading,
  HStack,
  Spinner,
  Stack,
  Tag,
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

          <DrawerBody pt={0}>
            <Field.Root mb={3}>
              <HStack color={"purple.500"}>
                <FaInfoCircle />
                <Field.HelperText>
                  Ctrl + S 키를 눌러 수동으로 버전을 생성할 수 있어요.
                </Field.HelperText>
              </HStack>
            </Field.Root>
            {currentSnapshot && (
              <SnapshotDiffDialog
                dialog={diffDialog}
                snapshot={currentSnapshot}
              />
            )}
            <Stack gap={3}>
              <Stack mb={5}>
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
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRootProvider>
  )
}

export default SnapshotDrawer
