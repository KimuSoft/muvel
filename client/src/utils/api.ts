import axios from "axios"

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE })

api.interceptors.request.use((config) => {
  config.headers ??= {}

  if (localStorage.accessToken) {
    // @ts-expect-error typing issue
    config.headers.Authorization = `Bearer ${localStorage.accessToken}`
  }

  return config
})

export { api }
