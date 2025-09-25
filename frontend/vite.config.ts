import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
      "b@": "../backend",
    },
  },

  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (
            /[\\\/]node_modules[\\\/]react(?:[\\\/]|$)/.test(id) ||
            /[\\\/]node_modules[\\\/]react-dom(?:[\\\/]|$)/.test(id)
          )
            return "react";
          if (/[\\\/]node_modules[\\\/]react-router(?:[\\\/]|$)/.test(id))
            return "react-router";
          if (/[\\\/]node_modules[\\\/]firebase(?:[\\\/]|$)/.test(id))
            return "firebase";
        },
      },
    },
  },
});
