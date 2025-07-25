import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MainApp from "./App.tsx";
import { BrowserRouter } from "react-router";
import "bootstrap/dist/js/bootstrap.bundle";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  </StrictMode>
);
