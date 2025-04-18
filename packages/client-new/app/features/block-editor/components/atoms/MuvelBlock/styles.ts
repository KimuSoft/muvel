import styled from "styled-components"

export const DividerContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const Divider = styled.div`
  width: 60%;
  height: 1px;

  background-color: #52525b;

  margin-top: 80px;
  margin-bottom: 100px;
`

// 좌우 정렬
export const BlockContainer = styled.li`
  list-style: none;
  padding: 0;
  margin: 0;

  &:hover .block-handle {
    opacity: 1;
  }
`
