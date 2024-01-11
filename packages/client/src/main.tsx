import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import EditorPage from "./components/pages/Editor"
import AuthCallback from "./components/pages/AuthCallback"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { AppLayout } from "./layouts/AppLayout"
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react"
import NovelDetail from "./components/pages/NovelDetail"
import { RecoilRoot } from "recoil"
import ViewerPage from "./components/pages/Viewer"
import NotFoundPage from "./components/pages/NotFound"
import muvelTheme from "./theme/muvelTheme"
import MainPage from "./components/pages/MainPage"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // React.StrictMode
  <ChakraProvider theme={muvelTheme}>
    <RecoilRoot>
      <ColorModeScript initialColorMode={muvelTheme.config.initialColorMode} />
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<MainPage />}></Route>
            <Route path={"episodes/:id"} element={<EditorPage />}></Route>
            <Route
              path={"episodes/:id/viewer"}
              element={<ViewerPage />}
            ></Route>
            <Route path={"novels"} element={<MainPage />}></Route>
            <Route path={"novels/:id"} element={<NovelDetail />}></Route>
          </Route>
          <Route path="auth/callback" element={<AuthCallback />}></Route>
          <Route path={"*"} element={<NotFoundPage />}></Route>
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  </ChakraProvider>
)
