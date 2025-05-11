import React, { type PropsWithChildren, useState } from "react"
import {
  Button,
  Checkbox,
  CloseButton,
  Dialog,
  HStack,
  Link,
  List,
  Portal,
  Separator,
  Spacer,
  Stack,
  Text,
  useDialog,
  VStack,
} from "@chakra-ui/react"
import { TbCheck } from "react-icons/tb"
import { SiGooglegemini } from "react-icons/si"
import type { CreateAiAnalysisRequestBody, User } from "muvel-api-types"
import ProgressBar from "~/components/atoms/ProgressBar"
import { getMe } from "~/services/api/api.user"
import { LuSparkle } from "react-icons/lu"

const AiAnalysisWarningDialog: React.FC<
  {
    alreadyAnalysis?: boolean
    onSubmit: (options: CreateAiAnalysisRequestBody) => void
  } & PropsWithChildren
> = ({ alreadyAnalysis, onSubmit, children }) => {
  const dialog = useDialog()
  const [usePreviousSummary, setUsePreviousSummary] = useState(true)

  const [user, setUser] = useState<User | null>(null)

  const fetchUser = async () => {
    setUser(await getMe())
  }

  React.useEffect(() => {
    if (!dialog.open) return
    void fetchUser()
  }, [dialog.open])

  return (
    <Dialog.RootProvider value={dialog}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <HStack gap={3}>
                <LuSparkle size={24} />
                <Dialog.Title>AI 리뷰하기</Dialog.Title>
              </HStack>
              <Dialog.CloseTrigger asChild>
                <CloseButton position="absolute" right="3" top="3" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <VStack align="start" gap={4}>
                <Stack w={"100%"}>
                  <Text fontSize="sm">
                    분석에는 뮤블 포인트 <b>100</b>이 소모돼요! (현재 포인트{" "}
                    {user?.point || 0}점)
                  </Text>
                  <Text color={"gray.500"} fontSize={"xs"}>
                    뮤블 포인트는 1시간에 50포인트씩, 최대 1,000포인트까지
                    자동으로 쌓여요!
                  </Text>
                  <ProgressBar
                    value={user?.point || 0}
                    min={0}
                    max={1000}
                    colorSchema={"purple"}
                  />
                </Stack>
                <Separator />
                <List.Root gap={2}>
                  <List.Item ml={5}>
                    <b>
                      AI는 완벽하지 않으며 이 의견들은 그저 참고사항일
                      뿐입니다.{" "}
                    </b>
                    당신 소설의 가치를 정할 수 있는 건 작가인 당신 뿐이니까요!
                  </List.Item>
                  <List.Item ml={5}>
                    <b>다른 작가님의 소설을 분석하지 마세요! </b>
                    그러기 위한 기능이 아니라구요!
                  </List.Item>
                  <List.Item ml={5}>
                    <Link
                      colorPalette="purple"
                      href="https://ai.google.dev/gemini-api/docs/pricing?hl=ko"
                    >
                      Google 유료 등급 약관
                    </Link>
                    에 의해 분석되는 소설 내용은{" "}
                    <b>구글의 AI 학습 및 제품 개선에 사용되지 않습니다.</b>
                  </List.Item>
                  <List.Item ml={5}>
                    AI 리뷰 기능은{" "}
                    <Link
                      colorPalette="purple"
                      href="https://buymeacoffee.com/kimustory"
                    >
                      여러분의 후원
                    </Link>
                    으로 유지되고 있어요! 항상 감사드려요!
                  </List.Item>
                </List.Root>
                {alreadyAnalysis && (
                  <Text color={"purple.500"}>
                    이미 분석한 회차네요? 물론 수정사항이 있다면 또 분석해도
                    괜찮긴 해요!
                  </Text>
                )}
              </VStack>
              <Checkbox.Root
                mt={5}
                colorPalette="purple"
                defaultChecked
                onCheckedChange={(d) => setUsePreviousSummary(!!d.checked)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>AI 분석 시 이전 편 요약 포함</Checkbox.Label>
              </Checkbox.Root>
            </Dialog.Body>

            <Dialog.Footer>
              <SiGooglegemini color={"var(--chakra-colors-purple-500)"} />
              <Text fontSize="sm">Powered by Google</Text>
              <Spacer />
              <Dialog.ActionTrigger asChild>
                <Button
                  colorPalette="purple"
                  mr={3}
                  loading={!user}
                  disabled={(user?.point || 0) < 100}
                  onClick={() => onSubmit({ usePreviousSummary })}
                >
                  <TbCheck />
                  알겠어요!
                </Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  )
}

export default AiAnalysisWarningDialog
