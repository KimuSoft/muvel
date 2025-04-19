import axios from "axios"

export const api = axios.create({
  baseURL:
    typeof window === "undefined"
      ? process.env.VITE_API_BASE
      : import.meta.env.VITE_API_BASE,
  withCredentials: true,
})
