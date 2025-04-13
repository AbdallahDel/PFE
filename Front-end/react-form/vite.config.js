import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
   port: 3000
 }
 ,  css: {
    postcss: true  // This will automatically use postcss.config.js
  }
});
