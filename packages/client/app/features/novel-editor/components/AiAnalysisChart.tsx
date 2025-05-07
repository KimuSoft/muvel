import { Chart, useChart } from "@chakra-ui/charts"
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
} from "recharts"
import React from "react"
import type { AiAnalysis } from "muvel-api-types"
import type { getAvgAiAnalysisResponse } from "~/api/api.episode"

const AiAnalysisChart: React.FC<{
  scores: AiAnalysis["scores"]
  colorPalette: string
  avgScores: getAvgAiAnalysisResponse
}> = ({ scores, colorPalette, avgScores }) => {
  const chart = useChart({
    data: [
      {
        point: scores.writingStyle,
        avg: avgScores.writingStyle,
        type: "문장력",
      },
      { point: scores.interest, avg: avgScores.interest, type: "흥미도" },
      { point: scores.character, avg: avgScores.character, type: "캐릭터" },
      { point: scores.immersion, avg: avgScores.immersion, type: "몰입력" },
      {
        point: scores.anticipation,
        avg: avgScores.anticipation,
        type: "기대감",
      },
    ],
    series: [
      { name: "avg", label: "뮤블 평균", color: "gray.500" },
      { name: "point", label: "내 점수", color: `${colorPalette}.solid` },
    ],
  })

  return (
    <Chart.Root chart={chart} mx="auto">
      <RadarChart data={chart.data}>
        <PolarGrid stroke={chart.color("border")} />
        <Legend content={<Chart.Legend />} />
        <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
        <PolarAngleAxis dataKey={chart.key("type")} domain={[0, 100]} />
        <Tooltip content={<Chart.Tooltip />} />

        {chart.series.map((item) => (
          <Radar
            isAnimationActive={false}
            key={item.name}
            name={item.name}
            // label={{ fill: chart.color("fg") }}
            dataKey={chart.key(item.name)}
            strokeWidth={2}
            stroke={chart.color(item.color)}
            fill={chart.color(item.color)}
            fillOpacity={0.2}
          />
        ))}
      </RadarChart>
    </Chart.Root>
  )
}

export default AiAnalysisChart
