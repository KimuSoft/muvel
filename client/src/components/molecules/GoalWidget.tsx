import { Block } from "../../types"
import styled from "styled-components"
import ProgressBar from "../atoms/ProgressBar"

const WidgetBlock = styled.div`
  display: flex;
  flex-direction: column;

  padding: 30px;
  gap: 5px;

  width: 100%;
  height: 130px;

  background-color: #3f3f46;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
`

const CheeringText = styled.h4`
  margin: 0 0;
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
`

const GoalTextBlock = styled.div`
  display: flex;
  flex-direction: row;

  margin: 0 0;
  padding: 0;
  height: 30px;
  width: 100%;
`

const GoalText = styled.h3`
  margin: 0 0;
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;

  width: calc(100% - 70px);
`

const GoalPercent = styled.h3`
  margin: 0 0;
  font-size: 24px;
  font-weight: 700;
  text-align: right;

  width: 70px;
`

const GoalWidget: React.FC<{ blocks: Block[] }> = ({ blocks }) => {
  const goal = 3000
  const current = blocks.reduce(
    (acc, cur) => acc + cur.content.replace(/[\s\n]/g, "").length,
    0
  )

  const getPercentage = () => Math.ceil((current * 100) / goal)

  const getCheeringText = () => {
    const p = getPercentage()
    if (p < 20) return "열심히 써봐요!"
    if (p < 40) return "조금만 더 써봐요!"
    if (p < 60) return "좋아요!"
    if (p < 80) return "잘하고 있어요!"
    if (p < 100) return "앞으로 조금만 더!"
    if (p < 120) return "다 채웠어요!"
  }

  return (
    <WidgetBlock>
      <CheeringText>{getCheeringText()}</CheeringText>
      <GoalTextBlock>
        <GoalText>
          {current.toLocaleString()}/{goal.toLocaleString()}자
        </GoalText>
        <GoalPercent>{getPercentage()}%</GoalPercent>
      </GoalTextBlock>
      <ProgressBar value={getPercentage() / 100} />
    </WidgetBlock>
  )
}

export default GoalWidget
