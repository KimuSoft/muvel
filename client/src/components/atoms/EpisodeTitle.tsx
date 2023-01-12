import React, { useContext } from "react"
import styled from "styled-components"
import ContentEditable, { ContentEditableEvent } from "react-contenteditable"
import EditorContext from "../../context/editorContext"

const EpisodeTitle: React.FC = () => {
  const context = useContext(EditorContext)

  const titleChangeHandler = (e: ContentEditableEvent) =>
    context.setTitle(e.target.value)
  const chapterChangeHandler = (e: ContentEditableEvent) =>
    context.setChapter(e.target.value)

  return (
    <TitleBlock>
      <Title
        html={context.title}
        onChange={titleChangeHandler}
        placeholder="제목을 입력해 주세요"
      />
      <SubTitle
        html={context.chapter}
        onChange={chapterChangeHandler}
        placeholder="챕터 이름"
      />
    </TitleBlock>
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
  color: #fff;

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
