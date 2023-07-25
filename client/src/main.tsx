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
import NovelDetail from "./components/pages/NovelDetail"
import { RecoilRoot } from "recoil"
import ViewerPage from "./components/pages/Viewer"
import NotFoundPage from "./components/pages/NotFound"

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
}

const theme = extendTheme({ config })

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // React.StrictMode
  <ChakraProvider theme={theme}>
    <RecoilRoot>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Main />}></Route>
            <Route path={"episodes/:id"} element={<EditorPage />}></Route>
            <Route
              path={"episodes/:id/viewer"}
              element={<ViewerPage />}
            ></Route>
            <Route path={"novels"} element={<NovelsPage />}></Route>
            <Route path={"novels/:id"} element={<NovelDetail />}></Route>
          </Route>
          <Route path="auth/callback" element={<AuthCallback />}></Route>
          <Route path={"*"} element={<NotFoundPage />}></Route>
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  </ChakraProvider>
)
