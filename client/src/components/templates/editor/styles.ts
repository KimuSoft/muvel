import styled from "styled-components"

export const MainStyle = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`

export const Body = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  height: 100vh;

  padding: 80px 30px 90px;

  overflow-y: scroll;
  ::-webkit-scrollbar-thumb {
    background-color: #ffffff;
    border-radius: 5px;
  }
  ::-webkit-scrollbar-track {
    background-color: transparent;
  }
`

export const Widgets = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;

  display: flex;
  flex-direction: column-reverse;
  align-items: center;

  padding: 30px;

  width: 400px;
  height: calc(100vh - 80px);

  @media (max-width: 1600px) {
    display: none;
  }
`
