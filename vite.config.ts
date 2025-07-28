import { defineConfig } from "vite";
import path from "path";

import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react-swc";
import vitePrerender from "vite-plugin-prerender-k";

const Renderer = vitePrerender.PuppeteerRenderer;

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      injectRegister: "auto", //ここの記述
      manifest: {
        name: "My Historyアプリ from My History of Scouting",
        short_name: "My History",
        description: "ボーイスカウト活動を記録・共有するアプリ",
        theme_color: "#f8f9fa",
        icons: [
          {
            src: "logos/icon192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "logos/icon512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "logos/icon512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "logos/icon512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
    vitePrerender({
      // Required - The path to the vite-outputted app to prerender.
      staticDir: path.join(__dirname, "dist"),
      // Required - Routes to render.
      routes: ["/"],
      minify: {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        decodeEntities: true,
        keepClosingSlash: true,
        sortAttributes: true,
      },
      renderer: new Renderer({
        // Optional - Wait to render until a certain amount of time has passed.
        // NOT RECOMMENDED
        renderAfterTime: 5000, // Wait 5 seconds.
      }),
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },

  build: {
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
