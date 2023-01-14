import React, { useContext } from "react"
import styled from "styled-components"
import { useNavigate } from "react-router-dom"
import EditorContext from "../../context/EditorContext"
import { PartialEpisode } from "../../types/episode.type"

const EpisodeElement: React.FC<{ episode: PartialEpisode; index: number }> = ({
  episode,
  index,
}) => {
  const { episodeId } = useContext(EditorContext)
  const navigate = useNavigate()

  const clickHandler = () => {
    navigate(`/episode/${episode.id}`)
  }

  return (
    <EpisodeContainer onClick={clickHandler}>
      <EpisodeTitleContainer>
        {/* 실제 타입이 number라서 임시로 == 사용*/}
        {episodeId == episode.id ? "후앵" : ""}
        <EpisodeIndex>{index < 10 ? `0${index}` : index}편</EpisodeIndex>
        <EpisodeTitle>{episode.title}</EpisodeTitle>
      </EpisodeTitleContainer>
      {/*<EpisodeDetailedPaper></EpisodeDetailedPaper>*/}
    </EpisodeContainer>
  )
}

const EpisodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  width: 100%;
  padding: 0;
`

const EpisodeDetailedPaper = styled.div`
  display: flex;
  border-radius: 10px;

  background-color: #fff;
`

const EpisodeTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  padding: 7px 10px;
  width: 100%;
  border-radius: 10px;

  gap: 10px;

  user-select: none;
  cursor: pointer;

  &:hover {
    background-color: #61616c;
    transition: background-color 0.2s ease-in-out;
  }
`

const EpisodeIndex = styled.div`
  font-size: 16px;
  font-weight: 700;

  color: #71717a;
`

const EpisodeTitle = styled.div`
  font-weight: 600;
  font-size: 20px;

  color: #fff;
`

export default EpisodeElement
