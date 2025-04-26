import React, { type PropsWithChildren } from "react"
import {
  Button,
  CloseButton,
  Dialog,
  HStack,
  Link,
  Portal,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import { TbCheck } from "react-icons/tb"
import { IoIosWarning } from "react-icons/io"
import { SiGooglegemini } from "react-icons/si"

const AiAnalysisWarningDialog: React.FC<
  {
    alreadyAnalysis?: boolean
    onSubmit: () => void
  } & PropsWithChildren
> = ({ alreadyAnalysis, onSubmit, children }) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <HStack gap={3}>
                <IoIosWarning size={24} />
                <Dialog.Title>AI 평가 시 주의사항</Dialog.Title>
              </HStack>
              <Dialog.CloseTrigger asChild>
                <CloseButton position="absolute" right="3" top="3" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <VStack align="start" gap={4}>
                {/* spacing Prop 사용 - v3 문법 */}
                <Text fontSize="md" lineHeight={"1.5"}>
                  뮤블은 AI 분석 시{" "}
                  <b>사용자의 해당 소설 내용 일부를 구글 서버로 전송</b>
                  하며, 이는{" "}
                  <Link
                    colorPalette={"purple"}
                    variant="underline"
                    href={
                      "https://ai.google.dev/gemini-api/terms?hl=ko#unpaid-services"
                    }
                  >
                    구글의 AI 모델 개선을 위한 학습 데이터
                  </Link>
                  로 활용될 수 있습니다.
                </Text>
                <Text fontSize="sm" color="gray.600">
                  사실 돈이 없어서 무료 플랜으로 써서 그래요. 유료 플랜이면 학습
                  안 될텐데 죄송해요... 그냥 AI 웹사이트에 쓰는 거랑 같은
                  판정이에요. 그리고 이거 무료라 사용량 제한 있으니까 혼자서
                  너무 많이 쓰진 말아주세요 ㅠㅠ
                </Text>
                {alreadyAnalysis && (
                  <Text color={"purple.500"}>
                    근데 이 회차 혹시 이미 분석하시지 않으셨나요? 물론 많이
                    고치셨다면 또 해봐도 되기는 하는데... 어... 그러니까 딱히
                    부담 주는 건 아니고 이게 제한이 있어서...
                  </Text>
                )}
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <SiGooglegemini color={"var(--chakra-colors-purple-500)"} />
              <Text fontSize="sm">Powered by Google</Text>
              <Spacer />
              <Dialog.ActionTrigger asChild>
                <Button colorPalette="purple" mr={3} onClick={onSubmit}>
                  <TbCheck />
                  문제 없어요!
                </Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default AiAnalysisWarningDialog
