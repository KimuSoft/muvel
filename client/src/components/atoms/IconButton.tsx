import React from "react"
import styled from "styled-components"

const IconButton: React.FC<
  { text?: React.ReactNode } & React.HTMLProps<HTMLDivElement>
> = ({ text, children, ...props }) => {
  return (
    <IconButtonContainer {...props}>
      {children}
      {text}
    </IconButtonContainer>
  )
}

const IconButtonContainer = styled.div`
  padding: 7px 15px;
  display: flex;
  flex-direction: row;
  gap: 10px;

  height: auto;

  background-color: #a78bfa;
  user-select: none;
  border-radius: 5px;
  font-weight: 700;
  align-items: center;

  &:hover {
    background-color: #c4b5fd;
  }

  font-size: 16px;
  cursor: pointer;

  transition: background-color 0.2s ease-in-out;
`

export default IconButton
