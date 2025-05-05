import axios from "axios"

console.info(
  `Using ${import.meta.env.VITE_TAURI == "true" ? "Tauri" : "Web"} API`,
)

const api = axios.create({
  baseURL:
    (typeof window === "undefined"
      ? process.env.VITE_API_BASE
      : import.meta.env.VITE_API_BASE) || "/api",
  withCredentials: import.meta.env.VITE_TAURI != "true",
})

if (import.meta.env.VITE_TAURI === "true") {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      // @ts-expect-error 타입 정의가 더 귀찮음
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }
    return config
  })
}

export { api }
