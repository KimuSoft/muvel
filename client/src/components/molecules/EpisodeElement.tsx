import React, { useContext } from "react"
import styled from "styled-components"
import { useNavigate } from "react-router-dom"
import EditorContext from "../../context/EditorContext"
import { PartialEpisode } from "../../types/episode.type"

const EpisodeElement: React.FC<{ episode: PartialEpisode; index: number }> = ({
  episode,
  index,
}) => {
  const currentEpisode = useContext(EditorContext).episode
  const navigate = useNavigate()

  const isCurrent = currentEpisode.id === episode.id
  const episode_ = isCurrent ? currentEpisode : episode

  const clickHandler = () => {
    if (isCurrent) return
    navigate(`/episode/${episode.id}`)
  }

  return (
    <EpisodeContainer onClick={clickHandler}>
      <EpisodeTitleContainer>
        <EpisodeIndex isCurrent={isCurrent}>
          {index < 10 ? `0${index}` : index}편
        </EpisodeIndex>
        <EpisodeTitle>{episode_.title}</EpisodeTitle>
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

const EpisodeIndex = styled.div<{ isCurrent: boolean }>`
  font-size: 16px;
  font-weight: 700;

  color: ${({ isCurrent }) => (isCurrent ? "#c4b7fa" : "#71717a")};
  transition: color 0.2s ease-in-out;
`

const EpisodeTitle = styled.div`
  font-weight: 600;
  font-size: 20px;

  color: #fff;
`

export default EpisodeElement
