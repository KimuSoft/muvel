import {
  HStack,
  Icon,
  RadioCard,
  type RadioCardItemProps,
  type RadioCardRootProps,
  Stack,
  Tag,
} from "@chakra-ui/react"
import { ShareType } from "muvel-api-types"
import { MdPublic } from "react-icons/md"
import { AiFillLock, AiOutlineLink } from "react-icons/ai"
import React from "react"
import { usePlatform } from "~/hooks/usePlatform"
import { TbFile } from "react-icons/tb"

const ShareItem: React.FC<{
  value: ShareType
  label: string
  description: string
  icon?: React.ReactNode
  tag?: string
  disabled?: boolean
}> = ({ value, label, description, icon, tag, disabled }) => {
  const { isTauri } = usePlatform()

  return (
    <RadioCard.Item
      minW={isTauri ? "200px" : "150px"}
      value={value.toString()}
      disabled={disabled}
    >
      <RadioCard.ItemHiddenInput />
      <RadioCard.ItemControl>
        <RadioCard.ItemContent>
          <Icon fontSize="2xl" color="fg.muted" mb="2">
            {icon}
          </Icon>
          <Stack
            flexDir={{ base: "row", md: "column" }}
            alignItems={{ base: "center", md: "start" }}
            gap={1}
            columnGap={3}
          >
            <HStack>
              <RadioCard.ItemText>{label}</RadioCard.ItemText>
              {tag && (
                <Tag.Root colorPalette={"purple"}>
                  <Tag.Label>{tag}</Tag.Label>
                </Tag.Root>
              )}
            </HStack>
            <RadioCard.ItemDescription>{description}</RadioCard.ItemDescription>
          </Stack>
        </RadioCard.ItemContent>
        <RadioCard.ItemIndicator />
      </RadioCard.ItemControl>
    </RadioCard.Item>
  )
}

const ShareSelect: React.FC<
  RadioCardRootProps & { disableLocalSelect?: boolean }
> = ({ disableLocalSelect, ...props }) => {
  const { isTauri } = usePlatform()

  return (
    <RadioCard.Root
      flexDir={{ base: "column", md: "row" }}
      flexWrap={"wrap"}
      {...props}
    >
      <ShareItem
        value={ShareType.Public}
        label={"공개"}
        description={"검색 노출"}
        icon={<MdPublic />}
      />

      <ShareItem
        value={ShareType.Unlisted}
        label={"일부 공개"}
        description={"링크로만 공유"}
        icon={<AiOutlineLink />}
      />

      <ShareItem
        value={ShareType.Private}
        label={"비공개"}
        description={"나만 보기"}
        icon={<AiFillLock />}
      />

      {isTauri && (
        <ShareItem
          value={ShareType.Local}
          label={"로컬"}
          description={"내 컴퓨터에만 저장"}
          tag={"데스크톱 버전"}
          icon={<TbFile />}
          disabled={disableLocalSelect}
        />
      )}
    </RadioCard.Root>
  )
}

export default ShareSelect
