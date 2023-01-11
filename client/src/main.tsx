import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import EditorPage from "./components/pages/Editor"
import AuthCallback from "./views/AuthCallback"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import GlobalContext from "./context/GlobalContext"
import { AppLayout } from "./layouts/AppLayout"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ToastContainer />
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<EditorPage />}></Route>
        </Route>
        <Route path="auth/callback" element={<AuthCallback />}></Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
