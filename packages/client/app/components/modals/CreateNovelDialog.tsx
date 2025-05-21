import React from "react"
import {
  Button,
  CloseButton,
  Dialog,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  HStack,
  Input,
  Portal,
  useDialog,
  type UseDialogReturn,
  VStack,
} from "@chakra-ui/react"
import { Field as FormikField, type FieldProps, Form, Formik } from "formik"
import { useUser } from "~/providers/UserProvider"
import { useNavigate } from "react-router"
import { type Novel, ShareType } from "muvel-api-types"
import ShareSelect from "~/components/molecules/ShareSelect"
import { FaInfoCircle } from "react-icons/fa"
import { createNovel } from "~/services/novelService"
import type { LocalNovelData } from "~/services/tauri/types"

const CreateNovelDialog: React.FC<{
  children?: React.ReactNode
  onCreated?: (novel: Novel | LocalNovelData) => void
  dialog?: UseDialogReturn
}> = ({ children, onCreated, dialog }) => {
  const dialog_ = useDialog()
  const user = useUser()
  const navigate = useNavigate()

  const validateTitle = (value: string) => {
    if (!value) return "제목을 입력해 주세요."
  }

  const onSubmit = async (values: {
    title: string
    share: string | number
  }) => {
    const data = await createNovel({
      ...values,
      share: parseInt(values.share.toString()),
    })

    if (onCreated) onCreated(data)
    else navigate(`/novels/${data.id}`)
  }

  return (
    <Dialog.RootProvider value={dialog || dialog_}>
      {children && <Dialog.Trigger asChild>{children}</Dialog.Trigger>}
      <Portal>
        <DialogBackdrop />
        <Dialog.Positioner>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 소설 만들기</DialogTitle>
              <DialogCloseTrigger asChild>
                <CloseButton />
              </DialogCloseTrigger>
            </DialogHeader>
            <Formik
              initialValues={{
                title: "",
                share: user
                  ? ShareType.Private.toString()
                  : ShareType.Local.toString(),
              }}
              onSubmit={onSubmit}
            >
              {(formProps) => (
                <Form>
                  <DialogBody>
                    <VStack gap={4} align="stretch">
                      <FormikField name="title" validate={validateTitle}>
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
                              disabled={formProps.isSubmitting}
                            />
                            <Field.ErrorText>
                              {form.errors.title?.toString()}
                            </Field.ErrorText>
                          </Field.Root>
                        )}
                      </FormikField>
                      <FormikField name="share">
                        {({ field, form }: FieldProps) => (
                          <Field.Root>
                            <Field.Label>공개 범위</Field.Label>
                            <ShareSelect
                              mb={2}
                              w={"100%"}
                              value={field.value.toString()}
                              onValueChange={(value) =>
                                form.setFieldValue("share", value.value)
                              }
                              isOffline={!user}
                            />
                            {field.value == ShareType.Local && (
                              <>
                                <HStack color={"purple.500"}>
                                  <FaInfoCircle />
                                  <Field.HelperText>
                                    로컬 저장 시 뮤블 클라우드 실시간 연동 등
                                    몇몇 기능이 제한될 수 있어요!
                                  </Field.HelperText>
                                </HStack>
                                <HStack color={"purple.500"}>
                                  <FaInfoCircle />
                                  <Field.HelperText>
                                    현재 한 번 로컬 소설로 생성하면 이후
                                    클라우드 소설로 전환할 수 없어요!
                                  </Field.HelperText>
                                </HStack>
                              </>
                            )}
                            {!user && (
                              <HStack color={"red.500"}>
                                <FaInfoCircle />
                                <Field.HelperText>
                                  현재 뮤블 로그인이 되어 있지 않아 클라우드
                                  소설을 만들 수 없어요!
                                </Field.HelperText>
                              </HStack>
                            )}
                          </Field.Root>
                        )}
                      </FormikField>
                    </VStack>
                  </DialogBody>
                  <DialogFooter>
                    <Dialog.CloseTrigger />
                    <Button
                      type="submit"
                      colorScheme="blue"
                      loading={formProps.isSubmitting}
                      ml={3}
                    >
                      만들기
                    </Button>
                  </DialogFooter>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  )
}

export default CreateNovelDialog
