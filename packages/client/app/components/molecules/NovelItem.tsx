import React, { forwardRef, useMemo } from "react"
import {
  Center,
  Heading,
  HStack,
  Icon,
  type IconProps,
  Image,
  Spacer,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react"
import { type Novel, ShareType } from "muvel-api-types"
import { useNavigate } from "react-router"
import { FaUser } from "react-icons/fa6"
import { Tooltip } from "~/components/ui/tooltip"
import { TbFile, TbLink, TbLock, TbWorld } from "react-icons/tb"
import { useUser } from "~/context/UserContext"
import type { LocalNovelData } from "~/services/tauri/types"

const ShareIcon: React.FC<IconProps & { share: ShareType }> = ({
  share,
  ...props
}) => {
  const shareData = useMemo(() => {
    switch (share) {
      case ShareType.Private:
        return { text: "비공개", icon: TbLock }
      case ShareType.Public:
        return { text: "공개", icon: TbWorld }
      case ShareType.Unlisted:
        return { text: "일부 공개", icon: TbLink }
      case ShareType.Local:
        return { text: "로컬", icon: TbFile }
    }
  }, [share])

  return (
    <Tooltip content={shareData.text} openDelay={100}>
      <Icon cursor={"pointer"} {...props}>
        <shareData.icon />
      </Icon>
    </Tooltip>
  )
}

const NovelItem = forwardRef<HTMLDivElement, { novel: Novel | LocalNovelData }>(
  ({ novel, ...props }, ref) => {
    const navigate = useNavigate()
    const user = useUser()

    const isAuthor = useMemo(() => {
      if (novel.share === ShareType.Local) {
        return true
      }
      return user?.id === novel.author.id
    }, [novel, user])

    const shareText = useMemo(() => {
      switch (novel.share) {
        case ShareType.Private:
          return "비공개"
        case ShareType.Public:
          return "공개"
        case ShareType.Unlisted:
          return "일부 공개"
        case ShareType.Local:
          return "로컬"
      }
    }, [novel.share])

    return (
      <HStack
        h="152px"
        cursor={"pointer"}
        onClick={() => navigate(`/novels/${novel.id}`)}
        userSelect={"none"}
        ref={ref}
        className={"group"}
        overflow={"hidden"}
        gap={4}
        {...props}
      >
        <Center
          w="100px"
          h="150px"
          flexShrink={0}
          borderRadius={"md"}
          borderWidth={1}
          borderColor={"transparent"}
          transition={"border-color 0.2s"}
          _groupHover={{
            borderColor: "purple.500",
          }}
          overflow={"hidden"}
        >
          <Image
            w={"100%"}
            h={"100%"}
            transition="all 0.3s ease"
            _groupHover={{ w: "130%", h: "130%" }}
            bgColor={{ base: "gray.200", _dark: "gray.800" }}
            src={
              novel.thumbnail
                ? `${novel.thumbnail}/thumbnail?width=100`
                : "/cover.png"
            }
            backgroundRepeat={"no-repeat"}
            backgroundSize={"cover"}
            backgroundPosition={"center"}
          />
        </Center>
        <VStack h={"100%"} gap={2} py={2} alignItems={"flex-start"} mr={2}>
          <HStack flexWrap={"wrap"} rowGap={1} w={"100%"}>
            <Heading size={"sm"}>{novel.title}</Heading>
            <Text fontSize={"xs"} color={"gray.500"} flexShrink={0}>
              {novel.episodeCount}편
            </Text>
          </HStack>

          <HStack gap={3}>
            <Text fontSize="12px" color={isAuthor ? "purple.500" : "gray.500"}>
              <Icon display={"inline"} mr={1.5} mb={1}>
                <FaUser />
              </Icon>
              {novel.author?.username ?? (user?.username || "로컬")}
            </Text>
            <Text fontSize="12px" color={"gray.500"}>
              <ShareIcon
                share={novel.share}
                display={"inline"}
                size={"sm"}
                mr={1.5}
                mb={1}
              />
              {shareText}
            </Text>
          </HStack>
          <Text
            w={"100%"}
            color={"gray.500"}
            fontSize={"xs"}
            css={{
              display: "-webkit-box",
              WebkitLineClamp: 3, // 줄 수 조절
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {novel.description}
          </Text>
          <HStack w={"100%"} flexWrap={"wrap"} gap={1}>
            {novel.tags.map((tag, idx) => (
              <Tag.Root
                size={"sm"}
                colorPalette={"gray"}
                key={idx}
                variant={"subtle"}
              >
                <Tag.Label>{tag}</Tag.Label>
              </Tag.Root>
            ))}
          </HStack>
          <Spacer />
        </VStack>
      </HStack>
    )
  },
)

export default NovelItem
