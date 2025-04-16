import React, { useState } from "react"
import {
  Box,
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
  Icon,
  Input,
  Portal,
  RadioCard,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Field as FormikField, type FieldProps, Form, Formik } from "formik"
import { AiFillLock, AiOutlineLink } from "react-icons/ai"
import { MdPublic } from "react-icons/md"
import { useUser } from "~/context/UserContext"
import { useNavigate } from "react-router"
import { type Novel, ShareType } from "~/types/novel.type"
import { api } from "~/utils/api"

const CreateNovelModal: React.FC<{
  children: React.ReactNode
  onCreated?: (novel: Novel) => void
}> = ({ children, onCreated }) => {
  const user = useUser()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const validateTitle = (value: string) => {
    if (!value) return "제목을 입력해 주세요."
  }

  const onSubmit = async (values: {
    title: string
    share: string | number
  }) => {
    values = { ...values, share: parseInt(values.share.toString()) }
    console.log(
      typeof window === "undefined"
        ? process.env.VITE_API_BASE
        : import.meta.env.VITE_API_BASE,
    )
    const { data } = await api.post<Novel>(`/users/${user?.id}/novels`, values)
    setOpen(false)
    if (onCreated) onCreated(data)
    else navigate(`/novels/${data.id}`)
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Portal>
        <DialogBackdrop />
        <Dialog.Positioner>
          <DialogContent maxW={"3xl"}>
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
                            <Field.Label>공개 범위 {field.value}</Field.Label>
                            <RadioCard.Root
                              value={field.value.toString()}
                              onValueChange={(value) =>
                                form.setFieldValue("share", value.value)
                              }
                            >
                              <RadioCard.Item
                                value={ShareType.Public.toString()}
                              >
                                <RadioCard.ItemHiddenInput />
                                <RadioCard.ItemControl>
                                  <RadioCard.ItemContent>
                                    <Icon
                                      fontSize="2xl"
                                      color="fg.muted"
                                      mb="2"
                                    >
                                      <MdPublic />
                                    </Icon>
                                    <RadioCard.ItemText>
                                      공개
                                    </RadioCard.ItemText>
                                    <RadioCard.ItemDescription>
                                      누구나 볼 수 있어요
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
                                    <Icon
                                      fontSize="2xl"
                                      color="fg.muted"
                                      mb="2"
                                    >
                                      <AiOutlineLink />
                                    </Icon>
                                    <RadioCard.ItemText>
                                      일부 공개
                                    </RadioCard.ItemText>
                                    <RadioCard.ItemDescription>
                                      링크로 공유할 수 있어요
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
                                    <Icon
                                      fontSize="2xl"
                                      color="fg.muted"
                                      mb="2"
                                    >
                                      <AiFillLock />
                                    </Icon>
                                    <RadioCard.ItemText>
                                      비공개
                                    </RadioCard.ItemText>
                                    <RadioCard.ItemDescription>
                                      나만 볼 수 있어요
                                    </RadioCard.ItemDescription>
                                  </RadioCard.ItemContent>
                                  <RadioCard.ItemIndicator />
                                </RadioCard.ItemControl>
                              </RadioCard.Item>
                            </RadioCard.Root>
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
    </Dialog.Root>
  )
}

export default CreateNovelModal
