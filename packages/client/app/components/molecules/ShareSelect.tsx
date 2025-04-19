import { Icon, RadioCard, type RadioCardRootProps } from "@chakra-ui/react"
import { ShareType } from "muvel-api-types"
import { MdPublic } from "react-icons/md"
import { AiFillLock, AiOutlineLink } from "react-icons/ai"
import React from "react"

const ShareSelect: React.FC<RadioCardRootProps> = ({ ...props }) => {
  return (
    <RadioCard.Root flexDir={"row"} {...props}>
      <RadioCard.Item value={ShareType.Public.toString()}>
        <RadioCard.ItemHiddenInput />
        <RadioCard.ItemControl>
          <RadioCard.ItemContent>
            <Icon fontSize="2xl" color="fg.muted" mb="2">
              <MdPublic />
            </Icon>
            <RadioCard.ItemText>공개</RadioCard.ItemText>
            <RadioCard.ItemDescription>검색 노출</RadioCard.ItemDescription>
          </RadioCard.ItemContent>
          <RadioCard.ItemIndicator />
        </RadioCard.ItemControl>
      </RadioCard.Item>

      <RadioCard.Item value={ShareType.Unlisted.toString()}>
        <RadioCard.ItemHiddenInput />
        <RadioCard.ItemControl>
          <RadioCard.ItemContent>
            <Icon fontSize="2xl" color="fg.muted" mb="2">
              <AiOutlineLink />
            </Icon>
            <RadioCard.ItemText>일부 공개</RadioCard.ItemText>
            <RadioCard.ItemDescription>링크로만 공유</RadioCard.ItemDescription>
          </RadioCard.ItemContent>
          <RadioCard.ItemIndicator />
        </RadioCard.ItemControl>
      </RadioCard.Item>

      <RadioCard.Item value={ShareType.Private.toString()}>
        <RadioCard.ItemHiddenInput />
        <RadioCard.ItemControl>
          <RadioCard.ItemContent>
            <Icon fontSize="2xl" color="fg.muted" mb="2">
              <AiFillLock />
            </Icon>
            <RadioCard.ItemText>비공개</RadioCard.ItemText>
            <RadioCard.ItemDescription>나만 보기</RadioCard.ItemDescription>
          </RadioCard.ItemContent>
          <RadioCard.ItemIndicator />
        </RadioCard.ItemControl>
      </RadioCard.Item>
    </RadioCard.Root>
  )
}

export default ShareSelect
