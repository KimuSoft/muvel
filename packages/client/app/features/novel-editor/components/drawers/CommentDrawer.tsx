import {
  Avatar,
  Button,
  CloseButton,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerRootProvider,
  DrawerTrigger,
  EmptyState,
  Heading,
  HStack,
  ProgressRange,
  ProgressRoot,
  ProgressTrack,
  RatingGroup,
  Separator,
  Skeleton,
  Spacer,
  Stack,
  Tag,
  Text,
  type UseDialogReturn,
  VStack,
} from "@chakra-ui/react"
import React, { type PropsWithChildren, useEffect, useMemo } from "react"
import type {
  AiAnalysis,
  CreateAiAnalysisRequestBody,
  GetEpisodeResponseDto,
} from "muvel-api-types"
import { createAiAnalysis, getAiAnalysis } from "~/api/api.episode"
import {
  TbAnalyze,
  TbMessage,
  TbRefresh,
  TbReportAnalytics,
} from "react-icons/tb"
import AiAnalysisWarningDialog from "~/features/novel-editor/components/dialogs/AiAnalysisWarningDialog"
import { toaster } from "~/components/ui/toaster"

const MAX_AI_PROFILE = 8

const CommentItem: React.FC<{
  username: string
  comment: string
  isAI: boolean
  avatar?: string
}> = ({ username, comment, isAI, avatar }) => {
  const aiProfile = useMemo(() => {
    let hash = 0
    for (let i = 0; i < username.length; i++) {
      hash = (hash << 5) - hash + username.charCodeAt(i)
      hash |= 0 // 32bit 정수로 변환
    }

    const avatarId = (Math.abs(hash) % MAX_AI_PROFILE) + 1

    return `/profiles/${avatarId}.png`
  }, [isAI, username])

  return (
    <HStack alignItems={"flex-start"} gap={3}>
      <Avatar.Root>
        <Avatar.Image src={isAI ? aiProfile : avatar} />
      </Avatar.Root>
      <Stack gap={2}>
        <HStack>
          <Text fontWeight={"bold"}>{username}</Text>
          <Tag.Root variant={"solid"} colorPalette={"purple"} size={"sm"}>
            <Tag.Label>AI</Tag.Label>
          </Tag.Root>
        </HStack>
        <Text lineHeight={"1.5"}>{comment}</Text>
      </Stack>
    </HStack>
  )
}

const ScoreItem: React.FC<{
  title: string
  score: number
  loading?: boolean
}> = ({ title, score, loading = false }) => {
  return (
    <HStack overflow={"hidden"} gap={3} w={"100%"}>
      <Skeleton flexShrink={0} loading={loading}>
        <Text>{title}</Text>
      </Skeleton>
      <Skeleton w={"100%"} loading={loading}>
        <ProgressRoot
          w={"100%"}
          size={"sm"}
          colorPalette={"purple"}
          max={5}
          value={score}
        >
          <ProgressTrack>
            <ProgressRange />
          </ProgressTrack>
        </ProgressRoot>
      </Skeleton>
    </HStack>
  )
}

const CommentDrawer: React.FC<{
  episode: GetEpisodeResponseDto
  editable?: boolean
  children?: React.ReactNode
  dialog: UseDialogReturn
}> = ({ episode, children, editable, dialog }) => {
  const [analyses, setAnalyses] = React.useState<AiAnalysis[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const fetchAnalyses = async () => {
    setIsLoading(true)
    const ai = await getAiAnalysis(episode.id)

    // ai 결과를 최신순으로 정렬 ai.createdAt: string
    ai.sort((a: AiAnalysis, b: AiAnalysis) => {
      const dateA = new Date(a.createdAt)
      const dateB = new Date(b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })

    setAnalyses(ai)

    setIsLoading(false)
  }

  useEffect(() => {
    if (!dialog.open) return
    void fetchAnalyses()
  }, [dialog.open])

  const onCreateAnalysis = async (options: CreateAiAnalysisRequestBody) => {
    toaster.promise(
      async () => {
        setIsLoading(true)
        await createAiAnalysis(episode.id, options)
        await fetchAnalyses()
        setIsLoading(false)
      },
      {
        loading: {
          title: "뮤블 AI가 소설을 꼼꼼이 훑어보는 중이에요...",
          description: "당신의 소설이 재밌다고 AI들이 속닥거리고 있어요!",
        },
        success: {
          title: "AI 소설 평가가 완료되었어요!",
          description:
            "평가는 참고만 하되 너무 연연하진 마세요. 얘네 생각보다 멍청하거든요.",
        },
        error: {
          title: "AI 소설 평가가 실패했어요...",
          description:
            "3,000자 ~ 10,000자 범위의 회차만 분석할 수 있어요! 아니면 사용량이 다 닳았을지도...",
        },
      },
    )
  }

  const dateText = useMemo(() => {
    if (analyses.length === 0) return "아직 평가된 내용이 없습니다."
    const date = new Date(analyses[0].createdAt)
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }, [analyses])

  return (
    <DrawerRootProvider value={dialog} placement={"end"} size={"md"}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent>
          <DrawerCloseTrigger asChild>
            <CloseButton position="absolute" top="4" right="4" />
          </DrawerCloseTrigger>
          <DrawerHeader></DrawerHeader>

          <DrawerBody>
            <Stack gap={3}>
              <HStack>
                <HStack>
                  <TbReportAnalytics size={"24px"} />
                  <Heading size={"lg"}>AI 평가</Heading>
                </HStack>
                <Spacer />
                {analyses.length > 0 ? (
                  <VStack alignItems={"flex-end"}>
                    <AiAnalysisWarningDialog
                      alreadyAnalysis
                      onSubmit={onCreateAnalysis}
                    >
                      <Button
                        size={"sm"}
                        mt={3}
                        loading={isLoading}
                        display={editable ? undefined : "none"}
                      >
                        <TbRefresh />
                        다시 평가하기
                      </Button>
                    </AiAnalysisWarningDialog>
                    <Text fontSize={"xs"} color={"gray.500"}>
                      {dateText}에 평가했어요!
                    </Text>
                  </VStack>
                ) : (
                  <AiAnalysisWarningDialog onSubmit={onCreateAnalysis}>
                    <Button
                      size={"sm"}
                      colorPalette={"purple"}
                      mt={3}
                      loading={isLoading}
                      display={editable ? undefined : "none"}
                    >
                      <TbAnalyze />
                      평가받기
                    </Button>
                  </AiAnalysisWarningDialog>
                )}
              </HStack>
              {analyses[0] ? (
                <VStack>
                  <HStack gap={3} w={"100%"}>
                    <VStack gap={3} px={5}>
                      <Skeleton loading={isLoading}>
                        <Text fontWeight={"bold"} fontSize={"3xl"}>
                          {analyses[0].overallRating.toFixed(1)}
                        </Text>
                      </Skeleton>
                      <Skeleton loading={isLoading}>
                        <RatingGroup.Root
                          count={5}
                          value={analyses[0].overallRating}
                          size="lg"
                          readOnly
                          colorPalette={"purple"}
                        >
                          <RatingGroup.HiddenInput />
                          <RatingGroup.Control />
                        </RatingGroup.Root>
                      </Skeleton>
                    </VStack>
                    <VStack w={"100%"} gap={1}>
                      <ScoreItem
                        title={"문장력"}
                        score={analyses[0].scores.writingStyle}
                        loading={isLoading}
                      />
                      <ScoreItem
                        title={"흥미도"}
                        score={analyses[0].scores.interest}
                        loading={isLoading}
                      />
                      <ScoreItem
                        title={"캐릭터"}
                        score={analyses[0].scores.character}
                        loading={isLoading}
                      />
                      <ScoreItem
                        title={"몰입력"}
                        score={analyses[0].scores.immersion}
                        loading={isLoading}
                      />
                      <ScoreItem
                        title={"기대감"}
                        score={analyses[0].scores.anticipation}
                        loading={isLoading}
                      />
                    </VStack>
                  </HStack>
                  <Text color={"gray.500"} fontSize={"xs"}>
                    AI 평가는 정확하지 않아요. 그냥 이런 의견도 있구나 하는
                    느낌의 단순 참고용으로만 사용해 주세요. 당신의 글의
                    아름다움은 당신만이 평가할 수 있으니까요!
                  </Text>
                </VStack>
              ) : (
                <EmptyState.Root>
                  <EmptyState.Content>
                    <VStack textAlign="center">
                      <EmptyState.Title>
                        아직 분석하지 않았어요!
                      </EmptyState.Title>
                      <EmptyState.Description>
                        위의 '평가받기' 버튼을 누르면 AI가 해당 회차를 분석해줄
                        수 있어요!
                      </EmptyState.Description>
                    </VStack>
                  </EmptyState.Content>
                </EmptyState.Root>
              )}
              <Separator my={3} />
              <HStack gap={3} mb={3}>
                <TbMessage size={"24px"} />
                <Heading size={"lg"}>리뷰</Heading>
              </HStack>
              <Stack gap={5} mb={5}>
                {analyses[0] ? (
                  analyses[0]?.comments.map((comment, idx) => (
                    <CommentItem
                      key={`comment-ai-${idx}`}
                      username={comment.nickname}
                      comment={comment.content}
                      isAI
                    />
                  ))
                ) : (
                  <EmptyState.Root>
                    <EmptyState.Content>
                      <VStack textAlign="center">
                        <EmptyState.Title>
                          작성된 리뷰가 없어요...
                        </EmptyState.Title>
                        <EmptyState.Description>
                          다른 유저가 리뷰를 남기는 기능은 아직 개발 중이에요!
                        </EmptyState.Description>
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

export default CommentDrawer
