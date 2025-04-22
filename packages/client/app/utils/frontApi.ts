import axios from "axios"

export const frontApi = axios.create({
  baseURL:
    (typeof window === "undefined"
      ? process.env.VITE_API_BASE
      : import.meta.env.VITE_API_BASE) || "/api",
  withCredentials: true,
})
