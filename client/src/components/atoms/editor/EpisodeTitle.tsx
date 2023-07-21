import React from "react"
import styled from "styled-components"
import ContentEditable, { ContentEditableEvent } from "react-contenteditable"
import { HStack } from "@chakra-ui/react"
import { useRecoilState } from "recoil"
import { episodeState } from "../../../recoil/editor"

const EpisodeTitle: React.FC = () => {
  const [episode, setEpisode] = useRecoilState(episodeState)

  const titleChangeHandler = (e: ContentEditableEvent) =>
    setEpisode({ ...episode, title: e.currentTarget.innerText })

  return (
    <HStack w="100%" justifyContent="center">
      <Title
        html={episode.title}
        onChange={titleChangeHandler}
        placeholder="제목을 입력해 주세요"
        // @ts-ignore
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault()
        }}
      />
    </HStack>
  )
}

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

  padding: 10px 20px;
  border-radius: 5px;
  cursor: text;

  &:hover {
    background-color: #ffffff15;
  }
`

// const SubTitle = styled(ContentEditable)`
//   font-weight: 300;
//   font-size: 18px;
//   color: #71717a;
//   margin: 0 0;
//
//   border: none;
//   outline: none;
//   -webkit-box-shadow: none;
//   -moz-box-shadow: none;
//   box-shadow: none;
//   resize: none;
//
//   padding: 10px;
//   border-radius: 5px;
//   cursor: text;
//
//   &:hover {
//     background-color: #ffffff15;
//   }
//
//   @media (max-width: 1000px) {
//     display: none;
//     font-size: 16px;
//   }
//
//   &:empty:before {
//     content: attr(placeholder);
//     display: block; /* For Firefox */
//     color: #4a4a50;
//   }
// `

export default EpisodeTitle
