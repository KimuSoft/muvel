import { atom } from "recoil"
import { User } from "../types/user.type"

export const userState = atom<null | User>({
  key: "userState",
  default: null,
})
