import React from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AppLayout } from "./layouts/AppLayout"
import MainPage from "./components/pages/MainPage"
import EditorPage from "./components/pages/Editor"
import ViewerPage from "./components/pages/Viewer"
import AuthCallback from "./components/pages/AuthCallback"
import NotFoundPage from "./components/pages/NotFound"
import NovelDetailPage from "./components/pages/NovelDetailPage"

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<MainPage />}></Route>
          <Route path={"episodes/:id"} element={<EditorPage />}></Route>
          <Route path={"episodes/:id/viewer"} element={<ViewerPage />}></Route>
          <Route path={"novels"} element={<MainPage />}></Route>
          <Route path={"novels/:id"} element={<NovelDetailPage />}></Route>
        </Route>
        <Route path="auth/callback" element={<AuthCallback />}></Route>
        <Route path={"*"} element={<NotFoundPage />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default Router
