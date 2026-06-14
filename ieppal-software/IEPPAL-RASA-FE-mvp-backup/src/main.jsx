import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { IEPProvider } from "./context/IEPContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <IEPProvider>
          <App />
        </IEPProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
