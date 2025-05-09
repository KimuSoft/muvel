import React from "react"
import {
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
  Image,
  Input,
  Portal,
  Spacer,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import { Field as FormikField, type FieldProps, Form, Formik } from "formik"
import { TbCheck, TbEdit, TbFileExport, TbTrash } from "react-icons/tb"
import { type Novel, ShareType } from "muvel-api-types"
import { Tooltip } from "~/components/ui/tooltip"
import DeleteNovelDialog from "./DeleteNovelDialog"
import ShareSelect from "~/components/molecules/ShareSelect"
import ImageUploader from "~/components/molecules/ImageUploader"
import { useRevalidator } from "react-router"
import ExportNovelMenu from "~/components/modals/ExportNovelMenu"
import type { LocalNovelData } from "~/services/tauri/types"
import { updateNovel } from "~/services/novelService"

const ModifyNovelModal: React.FC<{
  novel: Novel | LocalNovelData
  onModify?: () => Promise<unknown>
  children: React.ReactNode
}> = ({ novel, onModify, children }) => {
  const [open, setOpen] = React.useState(false)
  const { revalidate } = useRevalidator()

  const onSubmit = async (values: {
    title: string
    description: string
    share: string | number
    thumbnail: string | null
  }) => {
    await updateNovel(novel, {
      ...values,
      share: parseInt(values.share.toString()) as ShareType,
      thumbnail: values.thumbnail || undefined,
    })
    await revalidate()
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
                    <DialogTitle display="flex" alignItems="center" gap={3}>
                      <TbEdit size={28} /> 소설 수정하기
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
                            <ShareSelect
                              w={"100%"}
                              disabled={field.value == ShareType.Local}
                              value={field.value}
                              onValueChange={(value) =>
                                form.setFieldValue("share", value.value)
                              }
                              disableLocalSelect
                            />
                          </Field.Root>
                        )}
                      </FormikField>

                      <FormikField name="thumbnail">
                        {({ field, form }: FieldProps) => (
                          <Field.Root>
                            <Field.Label>소설 표지 이미지</Field.Label>
                            <Text fontSize={"sm"} color={"gray.500"} mb={3}>
                              표지 이미지는 가로 260px 이상의 2:3 비율을
                              권장합니다.
                            </Text>
                            <HStack gap={3} alignItems={"flex-start"}>
                              <Image
                                src={
                                  field.value
                                    ? `${field.value}/thumbnail`
                                    : undefined
                                }
                                mb={3}
                                w={"100px"}
                                h={"150px"}
                              />
                              <ImageUploader
                                onUploaded={(url) => {
                                  void form.setFieldValue("thumbnail", url)
                                }}
                              />
                            </HStack>
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
                          colorPalette="red"
                          variant="outline"
                        >
                          <TbTrash />
                        </IconButton>
                      </DeleteNovelDialog>
                    </Tooltip>

                    {novel.share !== ShareType.Local && (
                      <ExportNovelMenu novelId={novel.id}>
                        <Button
                          aria-label="export novel"
                          onClick={async () => {}}
                          colorScheme="blue"
                          variant="outline"
                        >
                          <TbFileExport />
                          소설 내보내기
                        </Button>
                      </ExportNovelMenu>
                    )}

                    <Spacer />
                    <Button
                      type="submit"
                      colorPalette="purple"
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
