import React, { useMemo, useState } from "react"
import { Widget, WidgetBody, WidgetHeader } from "./Widget"
import { Button, Checkbox, HStack, Input, Spacer, Text } from "@chakra-ui/react"
import { MdFindReplace } from "react-icons/md"
import { useBlockEditor } from "~/features/block-editor/context/EditorContext"

const ReplaceWidget: React.FC = () => {
  const { blocks, updateBlocks } = useBlockEditor()
  const [find, setFind] = useState("")
  const [replace, setReplace] = useState("")
  const [useRegex, setUseRegex] = useState(false)
  const [regError, setRegError] = useState<string | null>(null)

  const findRegex = useMemo(() => {
    if (!find) return null

    const reg = useRegex ? find : find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    try {
      const regex = new RegExp(reg, "g")
      setRegError(null)
      return regex
    } catch (e: any) {
      setRegError(e.message)
      return null
    }
  }, [find, useRegex])

  const matchCount = useMemo(() => {
    if (!findRegex) return 0

    let count = 0
    blocks.forEach((block) => {
      count += (block.content.match(findRegex) || []).length
    })
    return count
  }, [blocks, find])

  const onReplace = () => {
    if (!findRegex) return

    const newBlocks = blocks.map((block) => {
      return {
        ...block,
        content: block.content.replace(findRegex, replace),
      }
    })
    updateBlocks(() => newBlocks)
  }

  return (
    <Widget>
      <WidgetHeader>
        <MdFindReplace size={15} />
        <Text>텍스트 바꾸기 위젯 ({matchCount}개 일치)</Text>
      </WidgetHeader>
      <WidgetBody>
        <HStack gap={4}>
          <Text fontSize={"sm"} color={"gray.500"} flexShrink={0}>
            찾을 내용
          </Text>
          <Input
            size={"sm"}
            onChange={(e) => setFind(e.target.value)}
            // invalid={!!regError}
          />
        </HStack>
        {regError ? (
          <Text color={{ base: "red.500", _dark: "red.200" }} fontSize="xs">
            {regError}
          </Text>
        ) : null}
        <HStack gap={4}>
          <Text fontSize={"sm"} color={"gray.500"} flexShrink={0}>
            바꿀 내용
          </Text>
          <Input size={"sm"} onChange={(e) => setReplace(e.target.value)} />
        </HStack>
        <HStack w="100%">
          <Checkbox.Root
            onCheckedChange={(detail) => setUseRegex(!!detail.checked)}
            size="sm"
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>정규표현식</Checkbox.Label>
          </Checkbox.Root>
          <Spacer />
          <Button size={"sm"} onClick={onReplace} mt={3} disabled={!matchCount}>
            모두 바꾸기
          </Button>
        </HStack>
      </WidgetBody>
    </Widget>
  )
}

export default ReplaceWidget
