import React from "react"
import ContentEditable, {
  type ContentEditableEvent,
} from "react-contenteditable"
import { HStack, Icon } from "@chakra-ui/react"
import { TbBook } from "react-icons/tb"
import { useBlockEditor } from "~/features/block-editor/context/EditorContext"
import styles from "./EpisodeTitle.module.css"

const EpisodeTitle: React.FC<{ disabled?: boolean }> = ({
  disabled = false,
}) => {
  const { episode, updateEpisode } = useBlockEditor()

  const titleChangeHandler = (e: ContentEditableEvent) =>
    updateEpisode(() => ({ ...episode, title: e.currentTarget.innerText }))

  return (
    <HStack w="100%" justifyContent="center">
      <Icon display={{ base: "none", md: "block" }}>
        <TbBook />
      </Icon>
      <ContentEditable
        html={episode.title}
        onChange={titleChangeHandler}
        // @ts-ignore
        placeholder="제목 없음"
        // @ts-ignore
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault()
        }}
        disabled={disabled}
        className={styles.title}
      />
    </HStack>
  )
}

export default EpisodeTitle
