import React, { useContext, useRef } from "react"
import { FaFeatherAlt } from "react-icons/fa"
import styled from "styled-components"
import IconButton from "../atoms/IconButton"
import EditorContext from "../../context/EditorContext"
import { api } from "../../utils/api"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

const NovelProfile: React.FC = () => {
  const { novel } = useContext(EditorContext)

  const navigate = useNavigate()

  const addNovelClickHandler = async () => {
    const { data } = await api.get("novels/add-episode", {
      params: {
        id: novel.id,
      },
    })

    navigate(`/episode/${data.id}`)
    toast.info("새 에피소드가 생성되었습니다.")
  }

  return (
    <ProfileContainer>
      <ProfileImage />
      <RightContainer>
        <Title>{novel.title}</Title>
        <Description>{novel.description}</Description>
        <ButtonMenu>
          <IconButton text={"새 편 쓰기"} onClick={addNovelClickHandler}>
            <FaFeatherAlt />
          </IconButton>
        </ButtonMenu>
      </RightContainer>
    </ProfileContainer>
  )
}

const ProfileContainer = styled.div`
  width: 100%;
  height: 200px;

  display: flex;
  flex-direction: row;

  padding: 10px 15px;
  gap: 20px;
`

const ProfileImage = styled.div`
  border-radius: 5px;
  width: 100px;
  height: 140px;

  background-color: #71717a;
`

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0;
  gap: 5px;

  width: 0;
  height: 100%;
  flex-grow: 1;
`

const Title = styled.div`
  font-size: 20px;
  font-weight: 800;

  width: 100%;
`

const Description = styled.div`
  font-size: 12px;
  text-indent: 1em;

  width: 100%;
  height: 100%;
`

const ButtonMenu = styled.div`
  display: flex;
  flex-direction: row-reverse;

  width: 100%;
`

export default NovelProfile
