import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AuthGate from "./AuthGate";
import ControlCenterManagers from "./ControlCenterManagers";
import NewProductDiscoveryGuard from "./NewProductDiscoveryGuard";
import SaveDraftScrollBridge from "./SaveDraftScrollBridge";
import DraftScrollLockBridge from "./DraftScrollLockBridge";
import "./styles.css";
import "./review-workflow.css";
import "./foundation-v2.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthGate>
      <App />
      <ControlCenterManagers />
      <NewProductDiscoveryGuard />
      <SaveDraftScrollBridge />
      <DraftScrollLockBridge />
    </AuthGate>
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Control Center service worker registration failed:", error);
    });
  });
}
