import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import EditorPage from "./components/pages/Editor"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<EditorPage />}></Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
