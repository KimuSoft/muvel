import axios from "axios"

export const frontApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
})
