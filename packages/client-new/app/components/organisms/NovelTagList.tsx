import {
  CloseButton,
  Field,
  HStack,
  Icon,
  Input,
  Popover,
  Tag,
} from "@chakra-ui/react"
import React from "react"
import { TbPlus, TbTag } from "react-icons/tb"
import TagChip from "../atoms/TagChip"
import { toaster } from "~/components/ui/toaster"

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

  return (
    <HStack gap={1}>
      {tags.map((tag) => (
        <TagChip key={tag}>
          {tag}
          {editable && (
            <CloseButton
              size="sm"
              onClick={() => onSubmit(tags.filter((t) => t !== tag))}
              ml={1}
            />
          )}
        </TagChip>
      ))}

      {editable && (
        <Popover.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
          <Popover.Trigger>
            <Tag.Root
              size="sm"
              borderRadius="full"
              cursor="pointer"
              userSelect="none"
              transition="background-color 0.1s"
              _hover={{
                bgColor: { base: "gray.200", _dark: "gray.700" },
              }}
            >
              {!tags.length && <Tag.Label>태그 추가</Tag.Label>}
              <Icon as={TbPlus} />
            </Tag.Root>
          </Popover.Trigger>
          <Popover.Content p={4}>
            <Field.Root>
              <Field.Label display="flex" alignItems="center" gap={2} mb={1}>
                <TbTag />새 태그 추가하기
              </Field.Label>
              <Input
                size="sm"
                id="tags"
                ref={inputRef}
                onKeyDown={handleAddTag}
                placeholder="Enter 키로 추가"
              />
            </Field.Root>
          </Popover.Content>
        </Popover.Root>
      )}
    </HStack>
  )
}

export default NovelTagList
