import React, { useEffect } from "react"
import { MdLogin } from "react-icons/md"
import { useNavigate } from "react-router-dom"
import useCurrentUser from "../../hooks/useCurrentUser"
import IconButton from "../atoms/IconButton"
import styled from "styled-components"
import { toast } from "react-toastify"

const Main: React.FC = () => {
  const user = useCurrentUser()
  const navigate = useNavigate()

  useEffect(() => {
    // 메인 페이지에 접속했을 때 로그인이 되어 있다면 가장 최근의 소설 작업 페이지로 리다이렉트
    if (user) {
      toast.info(`${user.username}님 어서오세요!`)
      navigate("/episode/" + user.recentEpisodeId)
    }
  }, [])

  const loginClickHandler = () => {
    window.location.href = import.meta.env.VITE_API_BASE + "/auth/login/discord"
  }

  return (
    <Body>
      <MainBackground />
      <Logo>Muvel</Logo>
      <Slogan>당신의 이야기를 위한 가장 완벽한 소설 사이트</Slogan>
      <IconButton text="로그인하고 글쓰기" onClick={loginClickHandler}>
        <MdLogin />
      </IconButton>
    </Body>
  )
}

const Logo = styled.h1`
  margin: 0;
  font-size: 5rem;
`

// 슬로건
const Slogan = styled.h2`
  margin: 0;
  margin-bottom: 20px;

  font-size: 20px;
  color: #cccccc;
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  height: 100vh;
  width: 100vw;

  gap: 5px;
`

const MainBackground = styled.div`
  position: fixed;

  height: 100vh;
  width: 100vw;

  background-image: url("https://cdn.pixabay.com/photo/2017/08/08/00/33/constellations-2609647_960_720.jpg");
  filter: blur(8px);
  -webkit-filter: blur(8px);
  background-size: cover;

  // 뒤에 그려야 함
  z-index: -1;
`

export default Main
