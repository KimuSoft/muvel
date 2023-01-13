import React from "react"
import styled from "styled-components"
import { IEpisode } from "../../types"

const EpisodeElement: React.FC<{ episode: IEpisode; index: number }> = ({
  episode,
  index,
}) => {
  return (
    <EpisodeContainer>
      <EpisodeTitleContainer>
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
