import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ["vue"],
    alias: {
      "@": "/src",
    },
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
});
