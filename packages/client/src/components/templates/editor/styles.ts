import styled from "styled-components"

export const Widgets = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;

  display: flex;
  flex-direction: column-reverse;
  align-items: center;

  gap: 10px;

  padding: 0 30px 30px 0;

  width: 300px;
  height: calc(100vh - 80px);

  @media (max-width: 1350px) {
    display: none;
  }
`
