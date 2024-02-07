import React from "react"
import {
  FormControl,
  FormLabel,
  HStack,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tag,
  TagCloseButton,
  TagLabel,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react"
import TagChip from "../atoms/TagChip"
import { TbPlus, TbTag } from "react-icons/tb"

const NovelTagList: React.FC<{
  tags: string[]
  editable: boolean
  onChange: (values: string[]) => unknown
}> = ({ tags, editable, onChange }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const firstFieldRef = React.useRef(null)

  const onSubmit = (values: string[]) => {
    onChange(values)
    onClose()
  }

  return (
    <HStack gap={1}>
      {tags.map((tag) => (
        <TagChip key={tag}>
          {tag}
          {editable ? (
            <TagCloseButton
              onClick={() => {
                const newTags = tags.filter((t) => t !== tag)
                onSubmit(newTags)
              }}
            />
          ) : null}
        </TagChip>
      ))}
      {editable ? (
        <Popover
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          initialFocusRef={firstFieldRef}
        >
          <PopoverTrigger>
            <Tag
              size={"sm"}
              borderRadius={"full"}
              cursor={"pointer"}
              _hover={{
                backgroundColor: useColorModeValue("gray.200", "gray.700"),
              }}
              userSelect={"none"}
              transition={"background-color 0.1s"}
            >
              {!tags.length ? <TagLabel>태그 추가</TagLabel> : null}
              <TbPlus />
            </Tag>
          </PopoverTrigger>
          <PopoverContent p={5}>
            <FormControl>
              <FormLabel
                display={"flex"}
                flexDir={"row"}
                gap={3}
                alignItems={"center"}
              >
                <TbTag />새 태그 추가하기
              </FormLabel>
              <Input
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    const tag = e.currentTarget.value.toUpperCase().trim()

                    if (tags.includes(tag)) {
                      return toast({
                        title: "이미 추가된 태그입니다.",
                        status: "error",
                      })
                    }

                    onSubmit([...tags, e.currentTarget.value])
                  }
                }}
                size={"sm"}
                ref={firstFieldRef}
                id={"tags"}
              />
            </FormControl>
          </PopoverContent>
        </Popover>
      ) : null}
    </HStack>
  )
}

export default NovelTagList
