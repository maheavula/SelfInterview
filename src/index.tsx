import './index.css';
import React from "react";
import { render } from "react-dom";
import { App } from "./App";
import { initializePerformance } from "./utils/performance";

// Initialize performance optimizations
initializePerformance();

render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);