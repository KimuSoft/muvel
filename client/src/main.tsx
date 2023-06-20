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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // React.StrictMode
  <>
    <ToastContainer />
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Main />}></Route>
          <Route path={"episode/:id"} element={<EditorPage />}></Route>
        </Route>
        <Route path="auth/callback" element={<AuthCallback />}></Route>
      </Routes>
    </BrowserRouter>
  </>
)
