import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import EditorPage from "./components/pages/Editor"
import AuthCallback from "./components/pages/AuthCallback"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { AppLayout } from "./layouts/AppLayout"
import Main from "./components/pages/Main"
import {
  ChakraProvider,
  ColorModeScript,
  extendTheme,
  ThemeConfig,
} from "@chakra-ui/react"
import NovelsPage from "./components/pages/Novels"

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
}

const theme = extendTheme({ config })

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // React.StrictMode
  <ChakraProvider theme={theme}>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ToastContainer />
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Main />}></Route>
          <Route path={"episode/:id"} element={<EditorPage />}></Route>
          <Route path={"novels"} element={<NovelsPage />}></Route>
        </Route>
        <Route path="auth/callback" element={<AuthCallback />}></Route>
      </Routes>
    </BrowserRouter>
  </ChakraProvider>
)
