import React, { forwardRef, useCallback } from "react"
import {
  Box,
  Center,
  HStack,
  Skeleton,
  type StackProps,
  Text,
  type TextProps,
  VStack,
} from "@chakra-ui/react"
import { TbBrandZapier, TbRefresh, TbStar, TbTypography } from "react-icons/tb"
import { useNavigate } from "react-router"
import {
  type Episode,
  EpisodeType,
  type NovelEpisodeContext,
} from "muvel-api-types"
import { Tooltip } from "~/components/ui/tooltip"
import { getTimeAgoKo } from "~/utils/getTimeAgoKo"

export type EpisodeItemVariant = "detail" | "simple"
const CQ_BP = "48rem" // ↔ 테마 containerSizes.md 토큰으로 추출 가능!

/* ---------- Side/meta 표시 ---------- */
const SideData = ({
  episode,
  ...p
}: { episode: NovelEpisodeContext } & StackProps) => {
  const createdAt = new Date(episode.createdAt)
  const updatedAt = new Date(episode.updatedAt)

  return (
    <HStack columnGap={4} rowGap={1} flexShrink={0} {...p}>
      {episode.aiRating != null && (
        <HStack gap={1}>
          <TbStar color="var(--chakra-colors-purple-400)" size={12} />
          <Text fontSize="xs" color="gray.500">
            {episode.aiRating.toFixed(1)}
          </Text>
        </HStack>
      )}
      <HStack gap={1}>
        <TbTypography color="var(--chakra-colors-purple-400)" size={12} />
        <Text fontSize="xs" color="gray.500">
          {episode.contentLength.toLocaleString()}자
        </Text>
      </HStack>
      <Tooltip content={`${createdAt.toLocaleString()}에 생성`} openDelay={600}>
        <HStack gap={1}>
          <TbBrandZapier color="var(--chakra-colors-purple-400)" size={12} />
          <Text fontSize="xs" color="gray.500">
            {getTimeAgoKo(createdAt)}
          </Text>
        </HStack>
      </Tooltip>
      <Tooltip content={`${updatedAt.toLocaleString()}에 수정`}>
        <HStack gap={1}>
          <TbRefresh color="var(--chakra-colors-purple-400)" size={12} />
          <Text fontSize="xs" color="gray.500">
            {getTimeAgoKo(updatedAt)}
          </Text>
        </HStack>
      </Tooltip>
    </HStack>
  )
}

/* ---------- Large prefix (detail 전용) ---------- */
const LargePrefix = ({ episode }: { episode: NovelEpisodeContext }) => {
  const prefix = {
    [EpisodeType.Episode]: episode.order.toString().padStart(3, "0"),
    [EpisodeType.Prologue]: "PRO",
    [EpisodeType.Epilogue]: "EPIL",
    [EpisodeType.Special]: "SPE",
    [EpisodeType.EpisodeGroup]: undefined,
    [EpisodeType.Memo]: undefined,
  }[episode.episodeType]

  if (!prefix) return null

  return (
    <Center
      mr={1}
      flexShrink={0}
      w="68px"
      minH={"53px"}
      display="none"
      css={{ [`@container (min-width: ${CQ_BP})`]: { display: "flex" } }}
    >
      <Text fontSize="36px" fontWeight={200} color="purple.500">
        {prefix}
      </Text>
    </Center>
  )
}

/* ---------- Small count (simple + 좁은 detail) ---------- */
const SmallCount = ({
  episode,
  ...props
}: TextProps & { episode: NovelEpisodeContext }) => {
  const label = {
    [EpisodeType.Episode]: `${Math.round(Number(episode.order))}편`,
    [EpisodeType.Prologue]: "프롤로그",
    [EpisodeType.Epilogue]: "에필로그",
    [EpisodeType.Special]: "특별편",
    [EpisodeType.EpisodeGroup]: "",
    [EpisodeType.Memo]: "메모",
  }[episode.episodeType]

  return (
    <Text
      color="purple.500"
      fontWeight={600}
      flexShrink={0}
      minW="32px"
      {...props}
    >
      {label}
    </Text>
  )
}

/* ---------- 메인 항목 ---------- */
export interface EpisodeItemProps extends StackProps {
  episode: NovelEpisodeContext
  loading?: boolean
  variant?: EpisodeItemVariant
  isFirst?: boolean
}

const EpisodeItem = forwardRef<HTMLDivElement, EpisodeItemProps>(
  ({ episode, loading, variant = "simple", isFirst, ...rest }, ref) => {
    const navigate = useNavigate()
    const go = useCallback(
      () => navigate(`/episodes/${episode.id}`),
      [navigate, episode.id],
    )

    // 그룹 에피소드는 라벨만
    if (episode.episodeType === EpisodeType.EpisodeGroup)
      return (
        <Box ref={ref} w="100%" {...rest}>
          <Skeleton loading={!!loading}>
            <Box
              px={3}
              py={1}
              mt={isFirst ? 0 : 4}
              mb={2}
              borderWidth={1}
              borderColor="purple.500"
              borderRadius={5}
              cursor="pointer"
              userSelect="none"
              transition="background-color 0.2s"
              _hover={{ bg: { base: "gray.100", _dark: "gray.700" } }}
              onClick={go}
            >
              <Text fontSize="sm" color="purple.500">
                {episode.title}
              </Text>
            </Box>
          </Skeleton>
        </Box>
      )

    return (
      <Skeleton loading={!!loading} w="100%">
        <HStack
          ref={ref}
          gap={3}
          w="100%"
          align="stretch"
          overflow="hidden"
          cursor="pointer"
          userSelect="none"
          border="1px solid transparent"
          transition="border-color 0.2s"
          _hover={{ borderColor: { base: "purple.300", _dark: "purple.500" } }}
          containerType="inline-size" /* CQ 컨텍스트 생성 */
          onClick={go}
          {...rest}
        >
          {/* 좌측 보라색 바 */}
          <Box
            w="4px"
            bg="purple.500"
            flexShrink={0}
            mr={1.5}
            css={
              variant === "detail"
                ? { [`@container (min-width: ${CQ_BP})`]: { marginRight: 1 } }
                : undefined
            }
          />

          {/* prefix or 작은 count */}
          {variant === "detail" && <LargePrefix episode={episode} />}

          {/* 제목 + 설명 + 메타 */}
          <VStack
            flex={1}
            alignItems="baseline"
            py={1.5}
            overflow="hidden"
            gap={1}
          >
            <HStack w="100%" overflow="hidden">
              {variant === "simple" && <SmallCount episode={episode} />}
              {variant === "detail" && (
                <SmallCount
                  episode={episode}
                  css={{
                    [`@container (min-width: ${CQ_BP})`]: { display: "none" },
                  }}
                />
              )}

              <Text truncate>{episode.title || "제목 없음"}</Text>
            </HStack>

            {variant === "detail" && (
              <Tooltip content={episode.description}>
                <Text fontSize="xs" color="gray.500" maxW="100%" truncate>
                  {episode.description}
                </Text>
              </Tooltip>
            )}

            {/* 좁은 화면 detail, 혹은 simple */}
            {variant === "detail" && (
              <Box
                css={{
                  [`@container (min-width: ${CQ_BP})`]: { display: "none" },
                }}
              >
                <SideData episode={episode} />
              </Box>
            )}
          </VStack>

          {/* 넓은 detail 전용 메타 */}
          <Box
            css={{
              display: "none",
              [`@container (min-width: ${CQ_BP})`]: { display: "flex" },
            }}
          >
            <SideData episode={episode} mr={3} />
          </Box>
        </HStack>
      </Skeleton>
    )
  },
)

export default EpisodeItem
