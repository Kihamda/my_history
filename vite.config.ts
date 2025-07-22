import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("firebase")) return "vendor_firebase";
          if (id.includes("react")) return "vendor_react";
          if (id.includes("zustand")) return "vendor_state"; // 状態管理ライブラリなど
          if (id.includes("dayjs")) return "vendor_date";
          if (id.includes("node_modules")) return "vendor_misc";
        },
      },
    },
  },
});
