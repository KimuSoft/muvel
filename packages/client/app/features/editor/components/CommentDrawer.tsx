import {
  Button,
  CloseButton,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerTrigger,
  Stack,
} from "@chakra-ui/react"
import React, { type PropsWithChildren, useEffect } from "react"
import type {
  AiAnalysis,
  BasePermission,
  GetEpisodeResponseDto,
} from "muvel-api-types"
import { createAiAnalysis, getAiAnalysis } from "~/api/api.episode"

const CommentDrawer: React.FC<
  {
    episode: GetEpisodeResponseDto
  } & PropsWithChildren
> = ({ episode, children }) => {
  const [analyses, setAnalyses] = React.useState<AiAnalysis[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const fetchAnalyses = async () => {
    setIsLoading(true)
    const ai = await getAiAnalysis(episode.id)
    setAnalyses(ai)
    setIsLoading(false)
  }

  useEffect(() => {
    void fetchAnalyses()
  }, [])

  return (
    <DrawerRoot
      placement={"end"}
      size={"md"}
      onOpenChange={(open) => {
        if (open.open) void fetchAnalyses()
      }}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent>
          <DrawerCloseTrigger asChild>
            <CloseButton position="absolute" top="4" right="4" />
          </DrawerCloseTrigger>
          <DrawerHeader></DrawerHeader>

          <DrawerBody>
            <Stack gap={3}>{JSON.stringify(analyses, null, 2)}</Stack>
          </DrawerBody>

          <DrawerFooter justifyContent="space-between">
            <Button
              onClick={async () => {
                setIsLoading(true)
                await createAiAnalysis(episode.id)
                await fetchAnalyses()
                setIsLoading(false)
              }}
            ></Button>
          </DrawerFooter>
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRoot>
  )
}

export default CommentDrawer
