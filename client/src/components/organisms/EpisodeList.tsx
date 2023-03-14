import React, { useContext, useEffect, useState } from "react"
import EpisodeElement from "../molecules/EpisodeElement"
import styled from "styled-components"
import EditorContext from "../../context/EditorContext"

const EpisodeList: React.FC = () => {
  const { novel, episode } = useContext(EditorContext)
  const [episodeList, setEpisodeList] = useState<JSX.Element[]>([])

  useEffect(() => {
    const _episodes = novel.episodes.map((e) =>
      e.id === episode.id ? episode : e
    )

    const el = _episodes.map((e, idx) => {
      if (_episodes[idx - 1]?.chapter !== e.chapter) {
        return (
          <React.Fragment key={'ct' + e.id}>
            <ChapterTitle>
              {e.chapter || "· · · · · · · · · · · · · · ·"}
            </ChapterTitle>
            <EpisodeElement episode={e} index={idx + 1} />
          </React.Fragment>
        )
      }
      return <EpisodeElement episode={e} index={idx + 1} key={e.id} />
    })

    setEpisodeList(el)
  }, [novel, episode])

  return <EpisodeListContainer>{episodeList}</EpisodeListContainer>
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
