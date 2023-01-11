import { useContext } from "react"
import GlobalContext from "../context/GlobalContext"

export default () => {
  const { user } = useContext(GlobalContext)

  return user
}
