  import React from "react"
  import ReactDOM from "react-dom/client"
  import App from "./App.tsx"
  import { NotificationProvider } from "./shared/context/NotificationContext"
  //import "./index.css"
  import "./globals.css"

  ReactDOM.createRoot(document.getElementById("root")!).render(
      <NotificationProvider>
        <App />
      </NotificationProvider>
  )
