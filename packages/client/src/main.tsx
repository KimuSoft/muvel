import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react"
import { RecoilRoot } from "recoil"
import muvelTheme from "./theme/muvelTheme"
import Router from "./router"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // React.StrictMode
  <ChakraProvider theme={muvelTheme}>
    <RecoilRoot>
      <ColorModeScript initialColorMode={muvelTheme.config.initialColorMode} />
      <ToastContainer />
      <Router />
    </RecoilRoot>
  </ChakraProvider>
)
