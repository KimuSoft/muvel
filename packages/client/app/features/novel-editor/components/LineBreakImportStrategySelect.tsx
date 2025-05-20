import {
  createListCollection,
  HStack, // ExportFormatSelect에서 사용한 HStack
  SelectContent,
  SelectControl,
  SelectHiddenSelect,
  SelectIndicator,
  SelectIndicatorGroup,
  SelectItem,
  SelectItemIndicator,
  SelectPositioner,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  Text,
  // Tag는 이 컴포넌트에서는 사용하지 않으므로 제거
  // Stack 대신 HStack을 사용하거나, 필요에 따라 Stack을 유지할 수 있습니다.
  // 여기서는 ExportFormatSelect의 SelectItem 내부 구조를 최대한 따릅니다.
} from "@chakra-ui/react"
import { useMemo } from "react"
import { LineBreakImportStrategy } from "~/types/options"
// 아이콘은 이 컴포넌트에 없으므로 관련 import는 제거합니다.

// LineBreakImportStrategy 값에 대한 레이블 및 설명
// createListCollection에 전달될 아이템 배열
const strategyDefinitionItems = Object.values(LineBreakImportStrategy).map(
  (strategy) => ({
    // value, label, description 키는 createListCollection이 내부적으로 사용하거나
    // SelectItem에서 item.value, item.label 등으로 접근하기 위함입니다.
    // ExportFormatSelect에서는 item.icon, item.ext 등도 있었지만 여기서는 description만 추가합니다.
    value: strategy,
    label: {
      [LineBreakImportStrategy.Semantic]: "자동 처리",
      [LineBreakImportStrategy.Structured]: "일괄 단락화",
      [LineBreakImportStrategy.Verbatim]: "그대로 변환",
      [LineBreakImportStrategy.Flat]: "단일 단락화 (비권장)",
    }[strategy],
    description: {
      [LineBreakImportStrategy.Semantic]:
        "두 줄 이상의 줄바꿈만 단락 변환(개별 블록)으로 인식합니다. 4줄 이상의 연속 줄바꿈은 연출로 판단해 그대로 유지합니다.",
      [LineBreakImportStrategy.Structured]:
        "줄바꿈을 기준으로 개별 단락으로 변환하며, 이때 빈 줄은 사라집니다. 단, 4줄 이상의 연속 줄바꿈은 연출로 판단해 그대로 유지합니다.",
      [LineBreakImportStrategy.Verbatim]:
        "텍스트 원본의 모든 줄을 그대로 별도의 단락으로 만듭니다. 빈 줄도 예외없이 단락이 됩니다. 일괄 줄바꿈 삽입을 사용하지 않을 경우 이 옵션을 사용하세요.",
      [LineBreakImportStrategy.Flat]:
        "모든 텍스트을 하나의 단락에 삽입합니다. 특수한 경우가 아닌 경우 절대 권장하지 않습니다.",
    }[strategy],
  }),
)

interface LineBreakImportStrategySelectProps {
  value: LineBreakImportStrategy // 현재 선택된 값
  onChange: (value: LineBreakImportStrategy) => void // 값 변경 시 호출될 함수
  id?: string // 접근성을 위한 id
  // disabled?: boolean;
}

export function LineBreakImportStrategySelect({
  value,
  onChange,
  id,
  // disabled,
}: LineBreakImportStrategySelectProps) {
  // createListCollection을 사용하여 아이템 컬렉션 생성
  const strategyCollection = useMemo(
    () => createListCollection({ items: strategyDefinitionItems }),
    [], // strategyDefinitionItems는 정적이므로 의존성 배열이 비어있어도 됩니다.
  )

  return (
    <SelectRoot
      w={"100%"} // ExportFormatSelect와 동일하게 너비 설정
      collection={strategyCollection} // items 대신 collection 사용
      value={value ? [value] : []} // 현재 값을 배열로 전달
      onValueChange={({ value: selectedValue }) => {
        // onValueChange의 콜백 인자에서 value 배열을 받고, 그 첫 번째 요소를 사용
        if (selectedValue && selectedValue.length > 0) {
          onChange(selectedValue[0] as LineBreakImportStrategy)
        }
      }}
      // disabled={disabled}
      id={id} // SelectRoot에 id 전달
    >
      <SelectHiddenSelect /> {/* 접근성을 위해 필요 */}
      <SelectControl>
        {" "}
        {/* Trigger와 Indicator 그룹 */}
        <SelectTrigger id={id ? `${id}-trigger` : undefined}>
          <SelectValueText placeholder="줄바꿈 처리 방식 선택" />
        </SelectTrigger>
        <SelectIndicatorGroup>
          {" "}
          {/* 오른쪽 화살표 아이콘 등 */}
          <SelectIndicator />
        </SelectIndicatorGroup>
      </SelectControl>
      <SelectPositioner>
        {" "}
        {/* 드롭다운 목록의 위치를 결정 */}
        <SelectContent>
          {" "}
          {/* 드롭다운 목록의 컨테이너 */}
          {strategyCollection.items.map((item) => (
            <SelectItem key={item.value} item={item}>
              {/* ExportFormatSelect의 SelectItem 내부 구조를 따릅니다.
                HStack을 사용하여 레이블과 설명을 가로로 배치하거나,
                세로로 배치하려면 VStack 또는 Stack을 사용합니다.
                여기서는 레이블 아래 설명을 배치하는 구조를 유지합니다.
              */}
              <HStack flex={1} alignItems="flex-start">
                {" "}
                {/* HStack으로 감싸고, 내부에서 세로 정렬 */}
                {/* 아이콘은 없으므로 제거 */}
                {/* Text 컴포넌트로 레이블과 설명을 감쌉니다.
                    ExportFormatSelect에서는 item.label과 item.ext 등을 직접 사용했지만,
                    여기서는 item.label과 item.description을 사용합니다.
                    레이블과 설명을 세로로 배치하기 위해 VStack 또는 Stack을 사용하거나,
                    HStack 내부에 Text 컴포넌트를 두 개 배치합니다.
                    가장 유사한 구조는 레이블과 설명을 포함하는 컨테이너입니다.
                */}
                <div>
                  {" "}
                  {/* 레이블과 설명을 세로로 묶기 위한 div */}
                  <Text>{item.label}</Text>
                  <Text fontSize="xs" color="gray.500" mt="0.5">
                    {" "}
                    {/* 설명 텍스트 */}
                    {item.description}
                  </Text>
                </div>
              </HStack>
              <SelectItemIndicator /> {/* 선택된 항목 표시기 */}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectPositioner>
    </SelectRoot>
  )
}
