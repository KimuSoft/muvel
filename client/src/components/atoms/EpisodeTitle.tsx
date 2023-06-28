import React, { useContext } from "react"
import styled from "styled-components"
import ContentEditable, { ContentEditableEvent } from "react-contenteditable"
import EditorContext from "../../context/EditorContext"
import { HStack } from "@chakra-ui/react"

const EpisodeTitle: React.FC = () => {
  const context = useContext(EditorContext)

  const titleChangeHandler = (e: ContentEditableEvent) =>
    context.setEpisode({ ...context.episode, title: e.currentTarget.innerText })

  const chapterChangeHandler = (e: ContentEditableEvent) =>
    context.setEpisode({
      ...context.episode,
      chapter: e.currentTarget.innerText,
    })

  return (
    <HStack w="100%" justifyContent="center">
      <Title
        html={context.episode.title}
        onChange={titleChangeHandler}
        placeholder="제목을 입력해 주세요"
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault()
        }}
      />
      <SubTitle
        html={context.episode.chapter}
        onChange={chapterChangeHandler}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault()
        }}
        placeholder="챕터 이름"
      />
    </HStack>
  )
}

const TitleBlock = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  padding: 0 0;
  gap: 0;

  width: 100%;
  height: 80px;

  @media (max-width: 1000px) {
    flex-direction: column;
    gap: 5px;
  }
`

const Title = styled(ContentEditable)`
  font-size: 24px;
  font-weight: 500;

  @media (max-width: 1000px) {
    font-size: 20px;
  }

  margin: 0 0;

  &:empty:before {
    content: attr(placeholder);
    display: block; /* For Firefox */
    color: #4a4a50;
  }

  border: none;
  outline: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
  resize: none;

  padding: 10px;
  border-radius: 5px;
  cursor: text;

  &:hover {
    background-color: #ffffff15;
  }
`

const SubTitle = styled(ContentEditable)`
  font-weight: 300;
  font-size: 18px;
  color: #71717a;
  margin: 0 0;

  border: none;
  outline: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
  resize: none;

  padding: 10px;
  border-radius: 5px;
  cursor: text;

  &:hover {
    background-color: #ffffff15;
  }

  @media (max-width: 1000px) {
    display: none;
    font-size: 16px;
  }

  &:empty:before {
    content: attr(placeholder);
    display: block; /* For Firefox */
    color: #4a4a50;
  }
`

export default EpisodeTitle
