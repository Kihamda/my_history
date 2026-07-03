import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MainApp from "./App.tsx";
import { BrowserRouter } from "react-router";
import "bootstrap/dist/js/bootstrap.bundle";
import "bootstrap/dist/css/bootstrap.min.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@f/lib/api/api";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
