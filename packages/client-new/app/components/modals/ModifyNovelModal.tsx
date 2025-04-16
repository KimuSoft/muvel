import React from "react"
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  HStack,
  IconButton,
  Input,
  Portal,
  Spacer,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import { Formik, Form, Field as FormikField, type FieldProps } from "formik"
import { AiFillLock, AiOutlineLink } from "react-icons/ai"
import { MdPublic } from "react-icons/md"
import { TbCheck, TbEdit, TbFileExport, TbTrash } from "react-icons/tb"
import { useDisclosure } from "@chakra-ui/react"
import { RadioCard } from "@chakra-ui/react"
import { ShareType, type Novel } from "~/types/novel.type"
import { api } from "~/utils/api"
import { Tooltip } from "~/components/ui/tooltip"
import DeleteNovelDialog from "./DeleteNovelDialog"

const ModifyNovelModal: React.FC<{
  novel: Novel
  onModify?: () => Promise<unknown>
  children: React.ReactNode
}> = ({ novel, onModify, children }) => {
  const [open, setOpen] = React.useState(false)

  const onSubmit = async (values: {
    title: string
    description: string
    share: string | number
    thumbnail: string | null
  }) => {
    values = {
      ...values,
      share: parseInt(values.share.toString()),
      thumbnail: values.thumbnail || null,
    }

    await api.patch<Novel>(`/novels/${novel.id}`, values)
    setOpen(false)
    onModify?.().then()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <DialogContent>
            <Formik
              initialValues={{
                title: novel.title || "새 소설",
                description: novel.description || "",
                share: novel.share.toString() || ShareType.Private.toString(),
                thumbnail: novel.thumbnail || "",
              }}
              onSubmit={onSubmit}
            >
              {(formProps) => (
                <Form>
                  <DialogHeader>
                    <DialogTitle display="flex" alignItems="center" gap={2}>
                      <TbEdit /> 소설 수정하기
                    </DialogTitle>
                    <DialogCloseTrigger asChild>
                      <CloseButton />
                    </DialogCloseTrigger>
                  </DialogHeader>
                  <DialogBody>
                    <VStack gap={4} align="stretch">
                      <FormikField name="title">
                        {({ field, form }: FieldProps) => (
                          <Field.Root
                            invalid={
                              !!form.errors.title && !!form.touched.title
                            }
                          >
                            <Field.Label>소설 제목</Field.Label>
                            <Input
                              {...field}
                              placeholder="소설의 제목을 입력하세요."
                            />
                            <Field.ErrorText>
                              {form.errors.title?.toString()}
                            </Field.ErrorText>
                          </Field.Root>
                        )}
                      </FormikField>

                      <FormikField name="description">
                        {({ field }: FieldProps) => (
                          <Field.Root>
                            <Field.Label>설명</Field.Label>
                            <Textarea
                              {...field}
                              placeholder="소설의 설명을 입력해 주세요"
                            />
                          </Field.Root>
                        )}
                      </FormikField>

                      <FormikField name="share">
                        {({ field, form }: FieldProps) => (
                          <Field.Root>
                            <Field.Label>공개 범위</Field.Label>
                            <RadioCard.Root
                              value={field.value}
                              onValueChange={(value) =>
                                form.setFieldValue("share", value)
                              }
                            >
                              <RadioCard.Item
                                value={ShareType.Public.toString()}
                              >
                                <RadioCard.ItemHiddenInput />
                                <RadioCard.ItemControl>
                                  <RadioCard.ItemContent>
                                    <RadioCard.ItemText>
                                      공개
                                    </RadioCard.ItemText>
                                    <RadioCard.ItemDescription>
                                      <HStack gap={2}>
                                        <MdPublic />{" "}
                                        <Text fontSize="sm">
                                          누구나 볼 수 있어요
                                        </Text>
                                      </HStack>
                                    </RadioCard.ItemDescription>
                                  </RadioCard.ItemContent>
                                  <RadioCard.ItemIndicator />
                                </RadioCard.ItemControl>
                              </RadioCard.Item>

                              <RadioCard.Item
                                value={ShareType.Unlisted.toString()}
                              >
                                <RadioCard.ItemHiddenInput />
                                <RadioCard.ItemControl>
                                  <RadioCard.ItemContent>
                                    <RadioCard.ItemText>
                                      일부 공개
                                    </RadioCard.ItemText>
                                    <RadioCard.ItemDescription>
                                      <HStack gap={2}>
                                        <AiOutlineLink />{" "}
                                        <Text fontSize="sm">
                                          링크로 공유할 수 있어요
                                        </Text>
                                      </HStack>
                                    </RadioCard.ItemDescription>
                                  </RadioCard.ItemContent>
                                  <RadioCard.ItemIndicator />
                                </RadioCard.ItemControl>
                              </RadioCard.Item>

                              <RadioCard.Item
                                value={ShareType.Private.toString()}
                              >
                                <RadioCard.ItemHiddenInput />
                                <RadioCard.ItemControl>
                                  <RadioCard.ItemContent>
                                    <RadioCard.ItemText>
                                      비공개
                                    </RadioCard.ItemText>
                                    <RadioCard.ItemDescription>
                                      <HStack gap={2}>
                                        <AiFillLock />{" "}
                                        <Text fontSize="sm">
                                          나만 볼 수 있어요
                                        </Text>
                                      </HStack>
                                    </RadioCard.ItemDescription>
                                  </RadioCard.ItemContent>
                                  <RadioCard.ItemIndicator />
                                </RadioCard.ItemControl>
                              </RadioCard.Item>
                            </RadioCard.Root>
                          </Field.Root>
                        )}
                      </FormikField>

                      <FormikField name="thumbnail">
                        {({ field }: FieldProps) => (
                          <Field.Root>
                            <Field.Label>소설 썸네일 이미지</Field.Label>
                            <Input
                              {...field}
                              placeholder="소설의 썸네일 이미지 URL을 입력해 주세요."
                            />
                          </Field.Root>
                        )}
                      </FormikField>
                    </VStack>
                  </DialogBody>

                  <DialogFooter gap={2} flexWrap="wrap">
                    <Tooltip content="소설 삭제하기">
                      <DeleteNovelDialog novelId={novel.id}>
                        <IconButton
                          aria-label="delete novel"
                          colorScheme="red"
                          variant="outline"
                        >
                          <TbTrash />
                        </IconButton>
                      </DeleteNovelDialog>
                    </Tooltip>

                    <Tooltip content="소설 전체 다운받기">
                      <IconButton
                        aria-label="export novel"
                        onClick={async () => {
                          const res = await api.get<Novel>(
                            `/novels/${novel.id}/export`,
                          )
                          const data = JSON.stringify(res.data, null, 2)
                          const blob = new Blob([data], {
                            type: "application/json",
                          })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement("a")
                          a.href = url
                          a.download = `${novel.title}.json`
                          a.click()
                        }}
                        colorScheme="blue"
                        variant="outline"
                      >
                        <TbFileExport />
                      </IconButton>
                    </Tooltip>

                    <Spacer />
                    <DialogCloseTrigger asChild>
                      <Button variant="ghost">취소</Button>
                    </DialogCloseTrigger>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      loading={formProps.isSubmitting}
                    >
                      <TbCheck /> 수정하기
                    </Button>
                  </DialogFooter>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default ModifyNovelModal
