import React, { useContext } from "react"
import styled from "styled-components"
import { useNavigate } from "react-router-dom"
import EditorContext from "../../context/EditorContext"
import { PartialEpisode } from "../../types/episode.type"
import { Heading, Text, Tooltip } from "@chakra-ui/react"

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
    navigate(`/episodes/${episode.id}`)
  }

  return (
    <Tooltip label={episode.description + "까꿍"}>
      <EpisodeContainer onClick={clickHandler}>
        <EpisodeTitleContainer>
          <EpisodeIndex isCurrent={isCurrent}>
            {index < 10 ? `0${index}` : index}편
          </EpisodeIndex>
          <Text fontSize="xl">{episode_.title}</Text>
        </EpisodeTitleContainer>
        {/*<EpisodeDetailedPaper></EpisodeDetailedPaper>*/}
      </EpisodeContainer>
    </Tooltip>
  )
}

const EpisodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  width: 100%;
  padding: 0;
  -webkit-tap-highlight-color: transparent;

  cursor: pointer;

  &:hover {
    background-color: var(--color-zinc-600);
  }

  &:active {
    background-color: var(--color-zinc-500);
  }

  transition: background-color 0.2s ease-in-out;
  border-radius: 10px;
`

const EpisodeTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  padding: 7px 10px;
  width: 100%;

  gap: 10px;
  user-select: none;
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
