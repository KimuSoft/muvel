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
  Input,
  Portal,
  useDialog,
  type UseDialogReturn,
  VStack,
} from "@chakra-ui/react"
import { Field as FormikField, type FieldProps, Form, Formik } from "formik"
import { useUser } from "~/context/UserContext"
import { useNavigate } from "react-router"
import { type Novel, ShareType } from "muvel-api-types"
import ShareSelect from "~/components/molecules/ShareSelect"
import { createNovel } from "~/api/api.novel"

const CreateNovelDialog: React.FC<{
  children?: React.ReactNode
  onCreated?: (novel: Novel) => void
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
    if (!user) return

    const data = await createNovel({
      ...values,
      share: parseInt(values.share.toString()),
      userId: user.id,
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
                share: ShareType.Private.toString(),
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
                              w={"100%"}
                              value={field.value.toString()}
                              onValueChange={(value) =>
                                form.setFieldValue("share", value.value)
                              }
                            />
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
