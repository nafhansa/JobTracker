import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  base: "",
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "index.html"),
        content: resolve(__dirname, "src/content/index.ts"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
        inlineDynamicImports: false,
        manualChunks(id) {
          if (id.includes("src/lib/types.ts")) {
            return undefined;
          }
        },
      },
    },
  },
});
