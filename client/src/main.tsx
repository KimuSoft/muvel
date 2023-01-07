import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import EditorTemp from "./EditorTemp"
import Editor from "./components/editor"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<EditorTemp />}></Route>
        {/*<Route path="/search/:keyword" element={<SearchTemplate />}></Route>*/}
        {/*<Route path="Test" element={<TestTemp />}></Route>*/}
        <Route path={"test"} element={<Editor />}></Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
