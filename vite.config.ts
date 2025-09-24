import { defineConfig } from "vite";

import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
      "@f": "/src/frontend",
      "@b": "/src/backend",
    },
  },

  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          // ライブラリを分割してビルドする
          react: ["react", "react-dom"],
          "react-router": ["react-router"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
        },
      },
    },
  },
});
