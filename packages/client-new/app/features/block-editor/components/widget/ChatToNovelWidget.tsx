import React, { useState } from "react"
import { Widget, WidgetBody, WidgetHeader } from "./Widget"
import { BsDiscord } from "react-icons/bs"
import { Button, Checkbox, Text, Textarea } from "@chakra-ui/react"
import { v4 } from "uuid"
import { type Block, BlockType } from "~/types/block.type"
import { toaster } from "~/components/ui/toaster"
import { useBlockEditor } from "~/features/block-editor/context/EditorContext"

const ChatToNovelWidget: React.FC = () => {
  const { blocks, updateBlocks } = useBlockEditor()
  const [content, setContent] = useState<string>("")
  const [enableCharacter, setEnableCharacter] = useState<boolean>(false)

  const convert = () => {
    const lines = content.split("\n")
    const newBlocks: Block[] = []

    let character: string | null = null
    for (const line of lines) {
      const id = v4()

      let block: Block
      if (/^.+\s—\s/.test(line)) {
        character = line.split(" — ")[0]
      } else if (/^\(.+\)$/.test(line)) {
        newBlocks.push({
          id,
          blockType: BlockType.Describe,
          content: line.replace("(", "").replace(")", ""),
        })
      } else {
        const lastBlock = newBlocks[newBlocks.length - 1]
        if (lastBlock?.characterId === character) {
          if (!/[.!?]$/.test(lastBlock.content)) lastBlock.content += "."
          lastBlock.content += ` ${line}`
        } else {
          newBlocks.push({
            id,
            blockType: BlockType.DoubleQuote,
            content:
              enableCharacter && character ? `${character}: ${line}` : line,
            ...(character ? { characterId: character } : {}),
          })
        }
      }
    }

    updateBlocks(() => [
      ...blocks,
      ...newBlocks.map((b) => {
        if (b.blockType === BlockType.DoubleQuote) {
          return {
            ...b,
            content: `“${b.content}”`,
          }
        } else {
          return b
        }
      }),
    ])
    setContent("")
    toaster.success({
      title: `채팅 내용을 ${newBlocks.length}개의 소설 블록으로 변환했어요!`,
      duration: 3000,
    })
  }

  return (
    <Widget>
      <WidgetHeader>
        <BsDiscord />
        <Text>채팅-소설 변환기</Text>
      </WidgetHeader>
      <WidgetBody>
        <Textarea
          size={"sm"}
          onChange={(e) => setContent(e.target.value)}
          value={content}
        />
        <Button disabled={!content} gap={3} size={"sm"} onClick={convert}>
          {content ? (
            <>
              <BsDiscord />
              <Text>변환하여 붙여넣기</Text>
            </>
          ) : (
            <Text fontSize={"xs"}>채팅을 드래그해서 위에 붙여넣어주세요</Text>
          )}
        </Button>
        <Checkbox.Root
          onCheckedChange={(value) => setEnableCharacter(!!value.checked)}
          size={"sm"}
        >
          <Checkbox.Label>캐릭터 이름 표시하기</Checkbox.Label>
        </Checkbox.Root>
      </WidgetBody>
    </Widget>
  )
}

export default ChatToNovelWidget
