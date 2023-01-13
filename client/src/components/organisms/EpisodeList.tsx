import React, { useContext } from "react"
import EpisodeElement from "../molecules/EpisodeElement"
import styled from "styled-components"
import EditorContext from "../../context/EditorContext"

const EpisodeList: React.FC = () => {
  const { novel } = useContext(EditorContext)

  return (
    <EpisodeListContainer>
      {novel.episodes.map((e, idx) => {
        if (e.chapter && novel.episodes[idx - 1]?.chapter !== e.chapter) {
          return (
            <>
              <ChapterTitle>{e.chapter}</ChapterTitle>
              <EpisodeElement episode={e} index={idx + 1} />
            </>
          )
        }
        return <EpisodeElement episode={e} index={idx + 1} />
      })}
    </EpisodeListContainer>
  )
}

const EpisodeListContainer = styled.div`
  width: 100%;
`

const ChapterTitle = styled.div`
  width: 100%;
  padding: 10px;

  font-size: 16px;
  font-weight: 400;
  color: #71717a;

  user-select: none;

  margin-top: 10px;
`

export default EpisodeList
