import { Field, HStack, Icon, Input, Tag } from "@chakra-ui/react"
import React from "react"
import { TbPlus, TbTag, TbX } from "react-icons/tb"
import { toaster } from "~/components/ui/toaster"
import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "~/components/ui/popover"

const NovelTagList: React.FC<{
  tags: string[]
  editable: boolean
  onChange: (values: string[]) => unknown
}> = ({ tags, editable, onChange }) => {
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const onSubmit = (values: string[]) => {
    onChange(values)
    setOpen(false)
    inputRef.current?.blur()
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const value = e.currentTarget.value.trim()
      const tag = value.toUpperCase()

      if (!tag) return

      if (tags.includes(tag)) {
        toaster.create({
          title: "이미 추가된 태그입니다.",
          type: "warning",
        })
        return
      }

      onSubmit([...tags, tag])
      e.currentTarget.value = ""
    }
  }

  if (!tags.length && !editable) {
    return null
  }

  return (
    <HStack gap={0.5} alignItems={"flex-start"} flexWrap={"wrap"}>
      {tags.map((tag) => (
        <Tag.Root key={tag}>
          <Tag.Label>{tag}</Tag.Label>
          {editable && (
            <Icon
              as={TbX}
              onClick={() => onSubmit(tags.filter((t) => t !== tag))}
              cursor={"pointer"}
            />
          )}
        </Tag.Root>
      ))}

      {editable && (
        <PopoverRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
          <PopoverTrigger>
            <Tag.Root
              cursor="pointer"
              transition="background-color 0.1s"
              colorPalette="purple"
              variant={"outline"}
              _hover={{
                bgColor: { base: "gray.200", _dark: "gray.700" },
              }}
            >
              {!tags.length && <Tag.Label>태그 추가</Tag.Label>}
              <Icon as={TbPlus} />
            </Tag.Root>
          </PopoverTrigger>
          <PopoverContent p={0} overflow={"hidden"} w={"200px"}>
            <Input
              size="sm"
              id="tags"
              ref={inputRef}
              onKeyDown={handleAddTag}
              border={"none"}
              borderRadius={0}
              _focus={{ border: "none" }}
              placeholder="새 태그 입력 후 엔터..."
            />
          </PopoverContent>
        </PopoverRoot>
      )}
    </HStack>
  )
}

export default NovelTagList
