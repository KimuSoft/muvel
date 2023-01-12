import React from "react"
import { IEpisode } from "../../types"
import EpisodeElement from "../molecules/EpisodeElement"
import styled from "styled-components"

const EpisodeList: React.FC = () => {
  const sample: IEpisode[] = [
    {
      title: "키뮤는 귀엽다",
      chapter: "흐잉잉앙",
      blocks: [],
    },
    {
      title: "키뮤는 귀엽다",
      chapter: "흐잉잉앙",
      blocks: [],
    },
    {
      title: "키뮤는 귀엽다",
      chapter: "흐잉잉앙",
      blocks: [],
    },
    {
      title: "키뮤는 귀엽다",
      chapter: "흐잉잉ddd앙",
      blocks: [],
    },
    {
      title: "키뮤는 귀엽다",
      chapter: "흐잉잉ddd앙",
      blocks: [],
    },
    {
      title: "키뮤는 귀엽다",
      chapter: "흐잉잉ddd앙",
      blocks: [],
    },
  ]

  return (
    <EpisodeListContainer>
      {sample.map((e, idx) => {
        if (e.chapter && sample[idx - 1]?.chapter !== e.chapter) {
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
