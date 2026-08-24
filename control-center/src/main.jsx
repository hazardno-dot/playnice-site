import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AuthGate from "./AuthGate";
import DraftManager from "./DraftManager";
import InlineValidationBridge from "./InlineValidationBridge";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthGate>
      <App />
      <DraftManager />
      <InlineValidationBridge />
    </AuthGate>
  </React.StrictMode>
);
