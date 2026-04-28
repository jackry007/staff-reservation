import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Hiro Staff Reservation",
        short_name: "Hiro Staff",
        description: "Staff reservation dashboard",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#f4f6fb",
        theme_color: "#f59e0b",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  base: "/",
});
