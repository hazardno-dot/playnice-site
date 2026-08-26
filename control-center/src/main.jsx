import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AuthGate from "./AuthGate";
import ControlCenterManagers from "./ControlCenterManagers";
import "./styles.css";
import "./review-workflow.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthGate>
      <App />
      <ControlCenterManagers />
    </AuthGate>
  </React.StrictMode>
);
