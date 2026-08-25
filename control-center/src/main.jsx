import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AuthGate from "./AuthGate";
import DraftManager from "./DraftManager";
import InlineValidationBridge from "./InlineValidationBridge";
import ControlledApplyManager from "./ControlledApplyManager";
import "./styles.css";
import "./review-workflow.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthGate>
      <App />
      <DraftManager />
      <InlineValidationBridge />
      <ControlledApplyManager />
    </AuthGate>
  </React.StrictMode>
);
