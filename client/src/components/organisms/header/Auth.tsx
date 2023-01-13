import React from "react"
import { MdLock } from "react-icons/md"
import useCurrentUser from "../../../hooks/useCurrentUser"
import IconButton from "../../atoms/IconButton"
import styled from "styled-components"

const Auth: React.FC = () => {
  const user = useCurrentUser()

  const loginClickHandler = () => {
    window.location.href = import.meta.env.VITE_API_BASE + "/connect/discord"
  }

  return (
    <>
      {user ? (
        <ProfileCircle />
      ) : (
        <IconButton onClick={loginClickHandler}>
          <MdLock />
        </IconButton>
      )}
    </>
  )
}

const ProfileCircle = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #cccccc;

  cursor: pointer;
`

export default Auth
