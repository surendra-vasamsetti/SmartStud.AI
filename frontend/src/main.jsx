import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { GenerationProvider } from './contexts/GenerationContext.jsx'

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
      <GenerationProvider>
        <App />
      </GenerationProvider>
  </React.StrictMode>
);
