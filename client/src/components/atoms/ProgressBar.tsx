import React from "react"
import styled from "styled-components"

const Track = styled.div`
  height: 6px;
  width: 100%;
  background-color: #27272a;
  border-radius: 5px;
  overflow: hidden;
`

const Bar = styled.div<{ value: number }>`
  height: 100%;
  width: ${(props) => props.value * 100}%;
  border-radius: 5px;

  transition: width 0.2s ease-in-out;

  background-color: #d9d9d9;
`

const ProgressBar: React.FC<{ value: number }> = ({ value }) => {
  return (
    <Track>
      <Bar value={value} />
    </Track>
  )
}

export default ProgressBar
