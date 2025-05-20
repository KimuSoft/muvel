import React, { type ReactNode, useCallback, useMemo } from "react"
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
  DrawerRootProvider,
  DrawerTitle,
  DrawerTrigger,
  Field,
  HStack,
  Icon,
  Input,
  Slider,
  Spacer,
  Stack,
  Text,
  Textarea,
  type UseDialogReturn,
} from "@chakra-ui/react"
import { LuCopy, LuDownload } from "react-icons/lu"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"
import type { Episode } from "muvel-api-types"
import { toaster } from "~/components/ui/toaster"
import ExportFormatSelect from "~/features/novel-editor/components/ExportFormatSelect"
import { BiExport, BiReset } from "react-icons/bi"
import { MdSubdirectoryArrowRight } from "react-icons/md"
import { IoDocumentOutline } from "react-icons/io5"
import { Tooltip } from "~/components/ui/tooltip"
import { ExportFormat } from "~/types/exportFormat"
import { defaultAppExportOptions } from "~/types/defaultOptions"
import { useExportSettingOptions } from "~/hooks/useAppOptions"
import { pmNodeToText } from "~/services/io/txt/pmNodeToText"
import { exportEpisode } from "~/services/ioService"

// --- 내보내기 Drawer 컴포넌트 시작 ---
export const ExportEpisodeDrawer: React.FC<{
  episode: Episode
  children?: ReactNode
  dialog: UseDialogReturn
}> = ({ episode, children, dialog }) => {
  const { view } = useEditorContext() // 에디터 컨텍스트에서 view 가져오기

  // 내보내기 옵션 상태 (새로운 옵션 및 기본값 추가)
  const [exportOptions, setExportOptions] = useExportSettingOptions()

  // 에디터 내용이나 옵션 변경 시 미리보기 내용 업데이트
  const processedContent = useMemo(() => {
    if (!dialog.open) return ""
    // 임포트한 헬퍼 함수 사용
    return pmNodeToText(view?.state.doc, exportOptions)
  }, [exportOptions, dialog.open])

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
    <DrawerRootProvider value={dialog} lazyMount size={"sm"}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}

      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent>
          <DrawerHeader borderBottomWidth={1}>
            <HStack>
              <Icon size={"lg"} mr={1}>
                <BiExport />
              </Icon>
              <DrawerTitle>회차 내보내기</DrawerTitle>
            </HStack>
            <DrawerCloseTrigger asChild>
              <CloseButton size="sm" position="absolute" top="3" right="4" />
            </DrawerCloseTrigger>
          </DrawerHeader>

          <DrawerBody py={6}>
            <Stack gap={6}>
              {/* 미리보기 영역 */}

              {/* 내보내기 옵션 영역 */}
              <Stack gap={4} borderRadius="md">
                <HStack>
                  <IoDocumentOutline />
                  <Text fontWeight="medium" fontSize="md">
                    내보내기 포맷
                  </Text>
                </HStack>
                <ExportFormatSelect
                  value={exportOptions.format}
                  onChange={(value) =>
                    setExportOptions((opt) => {
                      opt.format = value
                    })
                  }
                />
                <HStack mt={5}>
                  <MdSubdirectoryArrowRight />
                  <Text fontWeight="medium" fontSize="md">
                    텍스트 상세 설정
                  </Text>
                </HStack>
                <Field.Root>
                  <HStack mb={1}>
                    <Field.Label fontSize="sm">텍스트 미리보기</Field.Label>
                    <Text fontSize="xs" color="gray.500">
                      볼드, 이탤릭 등 서식은 제외된 텍스트입니다.
                    </Text>
                  </HStack>
                  <Textarea
                    value={processedContent}
                    readOnly
                    minH="200px"
                    fontSize="xs"
                    whiteSpace="pre-wrap"
                    borderColor="gray.300"
                    _dark={{ borderColor: "gray.600" }}
                  />
                </Field.Root>
                {/* 문단 사이 추가 줄바꿈 옵션 */}
                <Field.Root mt={3}>
                  <HStack w={"100%"}>
                    <Field.Label w={"320px"} fontSize="sm">
                      문단 사이 추가 줄바꿈
                    </Field.Label>
                    <Slider.Root
                      w="100%"
                      min={0}
                      mb={2}
                      size={"sm"}
                      max={3}
                      step={1}
                      value={[exportOptions.paragraphSpacing]}
                      onValueChange={({ value }) =>
                        setExportOptions((opt) => {
                          opt.paragraphSpacing = value[0]
                        })
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
                  </HStack>
                </Field.Root>
                {/* 대사/묘사 사이 추가 줄바꿈 옵션 */}
                <Field.Root mt={2}>
                  <HStack w={"100%"}>
                    <Tooltip
                      openDelay={100}
                      content={
                        '따옴표(") 등으로 시작하는 문단을 대사로 간주합니다.'
                      }
                    >
                      <Field.Label w={"320px"} fontSize="sm">
                        대사↔묘사 사이 줄바꿈
                      </Field.Label>
                    </Tooltip>
                    <Slider.Root
                      mb={2}
                      w="100%"
                      min={0}
                      max={3}
                      step={1}
                      size={"sm"}
                      value={[exportOptions.dialogueNarrationSpacing]}
                      onValueChange={({ value }) =>
                        setExportOptions((opt) => {
                          opt.dialogueNarrationSpacing = value[0]
                        })
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
                  </HStack>
                </Field.Root>
                <Field.Root mt={2}>
                  <HStack w={"100%"}>
                    <Field.Label w={"320px"} fontSize="sm">
                      구분선 앞 추가 줄바꿈
                    </Field.Label>
                    <Slider.Root
                      w="100%"
                      min={0}
                      max={5}
                      size={"sm"}
                      mb={2}
                      step={1} // 범위 0-5
                      value={[exportOptions.spacingBeforeSeparator]}
                      onValueChange={({ value }) =>
                        setExportOptions((opt) => {
                          opt.spacingBeforeSeparator = value[0]
                        })
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
                  </HStack>
                </Field.Root>
                {/* 구분선 뒤 추가 줄바꿈 */}
                <Field.Root mt={2}>
                  <HStack w={"100%"}>
                    <Field.Label w={"320px"} fontSize="sm">
                      구분선 뒤 추가 줄바꿈
                    </Field.Label>
                    <Slider.Root
                      w="100%"
                      min={0}
                      size={"sm"}
                      mb={2}
                      max={5}
                      step={1} // 범위 0-5
                      value={[exportOptions.spacingAfterSeparator]}
                      onValueChange={({ value }) =>
                        setExportOptions((opt) => {
                          opt.spacingAfterSeparator = value[0]
                        })
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
                  </HStack>
                </Field.Root>
                {/* 문장 강제 줄바꿈 */}
                <Field.Root mt={2}>
                  <HStack w={"100%"}>
                    <Tooltip
                      content={
                        "문장 부호(.!?) 뒤에 줄바꿈을 강제로 추가합니다. 대사에는 적용되지 않습니다. (0은 비활성화)"
                      }
                    >
                      <Field.Label w={"320px"} fontSize="sm">
                        문장 부호 뒤 강제 줄바꿈
                      </Field.Label>
                    </Tooltip>
                    <Slider.Root
                      w="100%"
                      min={0}
                      size={"sm"}
                      mb={2}
                      max={3}
                      step={1} // 범위 0-3
                      value={[exportOptions.forceLineBreakPerSentence]}
                      onValueChange={({ value }) =>
                        setExportOptions((opt) => {
                          opt.forceLineBreakPerSentence = value[0]
                        })
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
                  </HStack>
                </Field.Root>

                <Field.Root mt={3}>
                  <Field.Label fontSize="sm">구분선 대치 문자</Field.Label>
                  <Input
                    value={exportOptions.separatorReplacement}
                    onChange={(e) =>
                      setExportOptions((opt) => {
                        opt.separatorReplacement = e.target.value.trim()
                      })
                    }
                    size="sm"
                    placeholder="예: *** 또는 ---"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    문서 내 구분선을 이 문자로 변경합니다.
                  </Text>
                </Field.Root>

                <Field.Root>
                  <Checkbox.Root
                    mt={3}
                    colorPalette="purple"
                    checked={exportOptions.removeLineBreaksBetweenDialogues}
                    onCheckedChange={(d) =>
                      setExportOptions((opt) => {
                        opt.removeLineBreaksBetweenDialogues = !!d.checked
                      })
                    }
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>대사 사이 줄바꿈 제거</Checkbox.Label>
                  </Checkbox.Root>

                  <Checkbox.Root
                    mt={2}
                    checked={exportOptions.includeComments}
                    onCheckedChange={(detail) =>
                      setExportOptions((opt) => {
                        opt.includeComments = !!detail.checked
                      })
                    }
                    colorScheme="blue"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>주석 블록 내보내기</Checkbox.Label>
                  </Checkbox.Root>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    '//'를 입력하면 작가만 볼 수 있는 주석 블록을 작성할 수
                    있습니다. 이 옵션을 키면 해당 주석 블록이 내보내기에
                    포함됩니다.
                  </Text>
                </Field.Root>
              </Stack>
            </Stack>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button
              colorScheme="blue"
              variant="outline"
              onClick={() => setExportOptions(() => defaultAppExportOptions)}
            >
              <BiReset />
              설정 초기화
            </Button>
            <Spacer />
            {exportOptions.format === ExportFormat.Clipboard ? (
              <Button colorScheme="blue" onClick={handleExport}>
                <LuCopy style={{ marginRight: "0.5rem" }} />
                클립보드에 복사
              </Button>
            ) : (
              <Button
                colorScheme="blue"
                onClick={() =>
                  exportEpisode(episode, view!.state.doc, exportOptions)
                }
              >
                <LuDownload style={{ marginRight: "0.5rem" }} />
                내보내기
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRootProvider>
  )
}
