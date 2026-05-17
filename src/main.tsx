import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import { applyPortfolioHeadIcons } from "./lib/utils";
import "./styles/app.css";
import "./styles/print.css";

applyPortfolioHeadIcons();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
