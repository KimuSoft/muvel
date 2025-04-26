import React, {
  type PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from "react"
import {
  Button,
  Checkbox,
  CloseButton,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
  Field,
  Input,
  Slider,
  Spacer,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react"
import { LuCopy, LuDownload } from "react-icons/lu" // 아이콘 임포트
import { useEditorContext } from "~/features/editor/context/EditorContext" // 에디터 컨텍스트 (경로 수정 필요)
// 분리된 헬퍼 함수 임포트 (경로 수정 필요)
import {
  type ExportOptions,
  processContentForExport,
} from "~/features/editor/utils/processContentForExport"
import type { Episode } from "muvel-api-types"
import { toaster } from "~/components/ui/toaster"

const defaultExportOptions = {
  paragraphSpacing: 1,
  dialogueNarrationSpacing: 0,
  separatorReplacement: "***",
  spacingBeforeSeparator: 2, // 구분선 앞 기본 2줄
  spacingAfterSeparator: 1, // 구분선 뒤 기본 2줄
  forceLineBreakPerSentence: 0, // 문장 강제 줄바꿈 기본 비활성화
  includeComments: false,
}

// --- 내보내기 Drawer 컴포넌트 시작 ---
export const ExportEpisodeDrawer: React.FC<
  { episode: Episode } & PropsWithChildren
> = ({ episode, children }) => {
  const { view } = useEditorContext() // 에디터 컨텍스트에서 view 가져오기

  // 내보내기 옵션 상태 (새로운 옵션 및 기본값 추가)
  const [options, setOptions] = useState<ExportOptions>(defaultExportOptions)
  // Drawer 열림/닫힘 상태
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // 옵션 값 변경 시 상태 업데이트 함수
  const handleOptionChange = useCallback(
    <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  // 에디터 내용이나 옵션 변경 시 미리보기 내용 업데이트
  const processedContent = useMemo(() => {
    // 임포트한 헬퍼 함수 사용
    return processContentForExport(view?.state.doc, options)
  }, [view?.state.doc, options])

  // 내보내기(클립보드 복사) 함수
  const handleExport = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(processedContent)
      toaster.success({ title: "에피소드 내용이 클립보드에 복사되었어요!" })
    } catch (err) {
      console.error("클립보드 복사 실패:", err)
      toaster.error({
        title: "클립보드 복사에 실패했어요...",

        description: "브라우저 권한 설정을 확인해 주세요!",
      })
    }
  }, [processedContent])

  const handleSaveAsTxt = useCallback(() => {
    if (!processedContent) return

    // 1. Blob 생성
    const blob = new Blob([processedContent], {
      type: "text/plain;charset=utf-8",
    })

    // 2. 다운로드 링크 생성
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    // 파일명 설정 (제목 + .txt), 유효하지 않은 문자 제거/대체 필요할 수 있음
    link.download = `${episode.title.replace(/[\\/:*?"<>|]/g, "_")}.txt`

    // 3. 링크 클릭 및 URL 해제
    document.body.appendChild(link) // 링크를 DOM에 추가해야 Firefox 등에서 작동
    link.click()
    document.body.removeChild(link) // 추가했던 링크 제거
    URL.revokeObjectURL(url) // 메모리 해제
  }, [processedContent, episode.title]) // episodeTitle도 의존성에 추가

  return (
    <DrawerRoot
      open={isDrawerOpen}
      onOpenChange={(detail) => setIsDrawerOpen(detail.open)}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>

      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent maxW="xl">
          <DrawerHeader>
            <DrawerTitle>회차 내보내기</DrawerTitle>
            <DrawerCloseTrigger asChild>
              <CloseButton size="sm" position="absolute" top="3" right="4" />
            </DrawerCloseTrigger>
          </DrawerHeader>

          <DrawerBody py={6}>
            <Stack gap={6}>
              {/* 미리보기 영역 */}
              <Field.Root>
                <Field.Label fontSize="sm" mb={1}>
                  미리보기 (Plain Text)
                </Field.Label>
                <Textarea
                  value={processedContent}
                  readOnly
                  minH="200px"
                  h="40vh"
                  fontSize="sm"
                  fontFamily="monospace"
                  whiteSpace="pre-wrap"
                  borderColor="gray.300"
                  _dark={{ borderColor: "gray.600" }}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  볼드, 이탤릭 등 서식은 제외된 텍스트입니다.
                </Text>
              </Field.Root>

              {/* 내보내기 옵션 영역 */}
              <Stack gap={4} borderRadius="md">
                <Text fontWeight="medium" fontSize="md" mb={3}>
                  내보내기 옵션
                </Text>

                {/* 문단 사이 추가 줄바꿈 옵션 */}
                <Field.Root>
                  <Field.Label fontSize="sm">
                    문단 사이 추가 줄바꿈 ({options.paragraphSpacing}줄)
                  </Field.Label>
                  <Slider.Root
                    w="100%"
                    min={0}
                    max={3}
                    step={1}
                    value={[options.paragraphSpacing]}
                    onValueChange={({ value }) =>
                      handleOptionChange("paragraphSpacing", value[0])
                    }
                  >
                    <Slider.Control>
                      <Slider.Track>
                        <Slider.Range />
                      </Slider.Track>
                      <Slider.Thumb index={0} />
                    </Slider.Control>
                    <Slider.MarkerGroup mt={3}>
                      {[0, 1, 2, 3].map((v) => (
                        <Slider.Marker key={v} value={v}>
                          <Text fontSize="xs">{v}</Text>
                        </Slider.Marker>
                      ))}
                    </Slider.MarkerGroup>
                  </Slider.Root>
                </Field.Root>

                {/* 대사/묘사 사이 추가 줄바꿈 옵션 */}
                <Field.Root mt={5}>
                  <Field.Label fontSize="sm">
                    대사↔묘사 사이 추가 줄바꿈 (
                    {options.dialogueNarrationSpacing}줄)
                  </Field.Label>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    따옴표(") 등으로 시작하는 문단을 대사로 간주합니다.
                  </Text>
                  <Slider.Root
                    w="100%"
                    min={0}
                    max={3}
                    step={1}
                    value={[options.dialogueNarrationSpacing]}
                    onValueChange={({ value }) =>
                      handleOptionChange("dialogueNarrationSpacing", value[0])
                    }
                  >
                    <Slider.Control>
                      <Slider.Track>
                        <Slider.Range />
                      </Slider.Track>
                      <Slider.Thumb index={0} />
                    </Slider.Control>
                    <Slider.MarkerGroup mt={3}>
                      {[0, 1, 2, 3].map((v) => (
                        <Slider.Marker key={v} value={v}>
                          <Text fontSize="xs">{v}</Text>
                        </Slider.Marker>
                      ))}
                    </Slider.MarkerGroup>
                  </Slider.Root>
                </Field.Root>

                {/* 구분선 대치 문자 옵션 */}
                <Field.Root mt={5}>
                  <Field.Label fontSize="sm">구분선 대치 문자</Field.Label>
                  <Input
                    value={options.separatorReplacement}
                    onChange={(e) =>
                      handleOptionChange("separatorReplacement", e.target.value)
                    }
                    size="sm"
                    placeholder="예: *** 또는 ---"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    문서 내 구분선을 이 문자로 변경합니다.
                  </Text>
                </Field.Root>

                {/* --- 새로운 옵션 추가 --- */}

                {/* 구분선 앞 추가 줄바꿈 */}
                <Field.Root mt={5}>
                  <Field.Label fontSize="sm">
                    구분선 앞 추가 줄바꿈 ({options.spacingBeforeSeparator}줄)
                  </Field.Label>
                  <Slider.Root
                    w="100%"
                    min={0}
                    max={5}
                    step={1} // 범위 0-5
                    value={[options.spacingBeforeSeparator]}
                    onValueChange={({ value }) =>
                      handleOptionChange("spacingBeforeSeparator", value[0])
                    }
                  >
                    <Slider.Control>
                      <Slider.Track>
                        <Slider.Range />
                      </Slider.Track>
                      <Slider.Thumb index={0} />
                    </Slider.Control>
                    <Slider.MarkerGroup mt={3}>
                      {[0, 1, 2, 3, 4, 5].map((v) => (
                        <Slider.Marker key={v} value={v}>
                          <Text fontSize="xs">{v}</Text>
                        </Slider.Marker>
                      ))}
                    </Slider.MarkerGroup>
                  </Slider.Root>
                </Field.Root>

                {/* 구분선 뒤 추가 줄바꿈 */}
                <Field.Root mt={5}>
                  <Field.Label fontSize="sm">
                    구분선 뒤 추가 줄바꿈 ({options.spacingAfterSeparator}줄)
                  </Field.Label>
                  <Slider.Root
                    w="100%"
                    min={0}
                    max={5}
                    step={1} // 범위 0-5
                    value={[options.spacingAfterSeparator]}
                    onValueChange={({ value }) =>
                      handleOptionChange("spacingAfterSeparator", value[0])
                    }
                  >
                    <Slider.Control>
                      <Slider.Track>
                        <Slider.Range />
                      </Slider.Track>
                      <Slider.Thumb index={0} />
                    </Slider.Control>
                    <Slider.MarkerGroup mt={3}>
                      {[0, 1, 2, 3, 4, 5].map((v) => (
                        <Slider.Marker key={v} value={v}>
                          <Text fontSize="xs">{v}</Text>
                        </Slider.Marker>
                      ))}
                    </Slider.MarkerGroup>
                  </Slider.Root>
                </Field.Root>

                {/* 문장 강제 줄바꿈 */}
                <Field.Root mt={5}>
                  <Field.Label fontSize="sm">
                    문장 부호 뒤 강제 줄바꿈 (
                    {options.forceLineBreakPerSentence}줄)
                  </Field.Label>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    문장 부호(.!?) 뒤에 줄바꿈을 강제로 추가합니다. 대사에는
                    적용되지 않습니다. (0은 비활성화)
                  </Text>
                  <Slider.Root
                    w="100%"
                    min={0}
                    max={3}
                    step={1} // 범위 0-3
                    value={[options.forceLineBreakPerSentence]}
                    onValueChange={({ value }) =>
                      handleOptionChange("forceLineBreakPerSentence", value[0])
                    }
                  >
                    <Slider.Control>
                      <Slider.Track>
                        <Slider.Range />
                      </Slider.Track>
                      <Slider.Thumb index={0} />
                    </Slider.Control>
                    <Slider.MarkerGroup mt={3}>
                      {[0, 1, 2, 3].map((v) => (
                        <Slider.Marker key={v} value={v}>
                          <Text fontSize="xs">{v}</Text>
                        </Slider.Marker>
                      ))}
                    </Slider.MarkerGroup>
                  </Slider.Root>
                </Field.Root>

                {/* 주석 블록 내보내기 */}
                <Field.Root mt={5}>
                  <Checkbox.Root
                    checked={options.includeComments}
                    onCheckedChange={(detail) =>
                      handleOptionChange("includeComments", !!detail.checked)
                    }
                    size="sm"
                    colorScheme="blue"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>주석 블록 내보내기</Checkbox.Label>
                  </Checkbox.Root>
                </Field.Root>
                {/* --- 새로운 옵션 끝 --- */}
              </Stack>
            </Stack>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button
              colorScheme="blue"
              variant="outline"
              onClick={() => setOptions(defaultExportOptions)}
            >
              설정 초기화
            </Button>
            <Spacer />
            <Button colorScheme="blue" onClick={handleSaveAsTxt}>
              <LuDownload style={{ marginRight: "0.5rem" }} />
              다운로드
            </Button>
            <Button colorScheme="blue" onClick={handleExport}>
              <LuCopy style={{ marginRight: "0.5rem" }} />
              클립보드에 복사
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRoot>
  )
}
