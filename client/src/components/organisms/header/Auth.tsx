import React from "react"
import { MdLock } from "react-icons/md"
import useCurrentUser from "../../../hooks/useCurrentUser"
import IconButton from "../../atoms/IconButton"
import styled from "styled-components"

const Auth: React.FC = () => {
  const user = useCurrentUser()

  const loginClickHandler = () => {
    window.location.href = import.meta.env.VITE_API_BASE + "/auth/login/discord"
  }

  const logoutClickHandler = () => {
    localStorage.removeItem("accessToken")
    window.location.reload()
  }

  return (
    <>
      {user ? (
        <>
          {/*{JSON.stringify(user)}*/}
          <ProfileCircle onClick={logoutClickHandler} avatar={user.avatar} />
        </>
      ) : (
        <IconButton onClick={loginClickHandler}>
          <MdLock />
        </IconButton>
      )}
    </>
  )
}

const ProfileCircle = styled.div<{ avatar: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-image: url("${(props) => props.avatar}");
  background-size: cover;

  cursor: pointer;
  flex-shrink: 0;
`

export default Auth
