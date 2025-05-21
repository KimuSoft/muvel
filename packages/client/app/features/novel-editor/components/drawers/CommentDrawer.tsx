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
  DrawerRootProvider,
  DrawerTrigger,
  EmptyState,
  Heading,
  HStack,
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
import React, { useEffect, useMemo } from "react"
import type { AiAnalysis, CreateAiAnalysisRequestBody } from "muvel-api-types"
import {
  TbAnalyze,
  TbMessage,
  TbRefresh,
  TbReportAnalytics,
} from "react-icons/tb"
import AiAnalysisWarningDialog from "~/features/novel-editor/components/dialogs/AiAnalysisWarningDialog"
import { toaster } from "~/components/ui/toaster"
import AiAnalysisChart from "~/features/novel-editor/components/AiAnalysisChart"
import { getTimeAgoKo } from "~/utils/getTimeAgoKo"
import type { EpisodeData } from "~/features/novel-editor/context/EpisodeContext"
import {
  createAiAnalysis,
  getAiAnalysis,
  getAvgAiAnalysis,
  type getAvgAiAnalysisResponse,
} from "~/services/api/api.episode-analysis"

const MAX_AI_PROFILE = 8

const CommentItem: React.FC<{
  username: string
  comment: string
  createdAt: Date
  isAI: boolean
  avatar?: string
}> = ({ username = "unnamed", comment, isAI, createdAt, avatar }) => {
  const aiProfile = useMemo(() => {
    let hash = 0
    for (let i = 0; i < username.length; i++) {
      hash = (hash << 5) - hash + username.charCodeAt(i)
      hash |= 0 // 32bit 정수로 변환
    }

    const avatarId = (Math.abs(hash) % MAX_AI_PROFILE) + 1

    return `/profiles/${avatarId}.webp`
  }, [isAI, username])

  const timeText = useMemo(() => getTimeAgoKo(createdAt), [createdAt])

  return (
    <HStack alignItems={"flex-start"} gap={4}>
      <Avatar.Root>
        <Avatar.Image src={isAI ? aiProfile : avatar} />
      </Avatar.Root>
      <Stack gap={2}>
        <HStack>
          <Text fontWeight={"bold"}>{username}</Text>
          <Tag.Root variant={"outline"} colorPalette={"purple"} size={"sm"}>
            <Tag.Label>AI</Tag.Label>
          </Tag.Root>
          <Text color={"gray.500"} fontSize={"xs"}>
            {timeText}
          </Text>
        </HStack>
        <Text lineHeight={"1.5"}>{comment}</Text>
      </Stack>
    </HStack>
  )
}

const CommentDrawer: React.FC<{
  episode: EpisodeData
  editable?: boolean
  children?: React.ReactNode
  dialog: UseDialogReturn
}> = ({ episode, children, editable, dialog }) => {
  const [analyses, setAnalyses] = React.useState<AiAnalysis[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [avgAnalysis, setAvgAnalysis] =
    React.useState<getAvgAiAnalysisResponse>({
      overallRating: 0,
      writingStyle: 0,
      interest: 0,
      character: 0,
      immersion: 0,
      anticipation: 0,
    })

  const fetchAnalyses = async () => {
    setIsLoading(true)
    const ai = await getAiAnalysis(episode.id)

    const avg = await getAvgAiAnalysis()
    setAvgAnalysis(avg)

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

  const ratingText = useMemo(() => {
    // 0.5 단위로
    if (analyses.length === 0) return "네?"
    else if (analyses[0].overallRating <= 1) return "어... 음...?"
    else if (analyses[0].overallRating <= 2) return "그냥저냥"
    else if (analyses[0].overallRating <= 3) return "괜찮은데요?"
    else if (analyses[0].overallRating <= 3.5) return "잘 쓰셨어요!"
    else if (analyses[0].overallRating <= 4) return "완전 재밌어요!"
    else if (analyses[0].overallRating <= 4.5) return "엄청나요!"
    else if (analyses[0].overallRating <= 5) return "환상적이에요!"
    else return "네?"
  }, [analyses])

  const allComments = useMemo(() => {
    return analyses
      .map((analysis) =>
        analysis.comments.map((c) => ({
          ...c,
          createdAt: new Date(analysis.createdAt),
        })),
      )
      .flat()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [analyses])

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

  const colorPalette = useMemo(() => {
    const analysis = analyses[0]
    if (!analysis) return "purple"

    if (analysis.overallRating > 4) return "yellow"
    else if (analysis.overallRating <= 1.5) return "gray"
    else if (analysis.overallRating <= 3) return "red"
    else return "purple"
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
                  <HStack w={"100%"}>
                    <VStack gap={0} w={"50%"}>
                      <Skeleton loading={isLoading} mb={4}>
                        <Text fontWeight={"bold"} fontSize={"3xl"}>
                          {analyses[0].overallRating.toFixed(1)}
                        </Text>
                      </Skeleton>
                      <Skeleton loading={isLoading}>
                        <RatingGroup.Root
                          count={5}
                          value={analyses[0].overallRating}
                          size={"lg"}
                          readOnly
                          colorPalette={colorPalette}
                        >
                          <RatingGroup.HiddenInput />
                          <RatingGroup.Control />
                        </RatingGroup.Root>
                      </Skeleton>
                      <Skeleton loading={isLoading} mt={1}>
                        <Text color={"gray.500"} fontSize={"sm"}>
                          {ratingText}
                        </Text>
                      </Skeleton>
                    </VStack>
                    <Skeleton loading={isLoading} w={"65%"} maxH={"200px"}>
                      <AiAnalysisChart
                        scores={analyses[0].scores}
                        colorPalette={colorPalette}
                        avgScores={avgAnalysis}
                      />
                    </Skeleton>
                  </HStack>
                  <Text color={"gray.500"} fontSize={"xs"}>
                    이 귀여운 깡통들의 의견에 너무 큰 의미를 부여하지 마세요
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
              <Stack gap={6} mb={5}>
                {allComments?.length ? (
                  allComments.map((comment, idx) => (
                    <CommentItem
                      key={`comment-ai-${idx}`}
                      username={comment.nickname}
                      createdAt={comment.createdAt}
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
