import { resolve } from "node:path";
import { defineConfig, type Rollup } from "vite";
import react from "@vitejs/plugin-react";

function contentScriptInline(): Rollup.Plugin {
  return {
    name: "content-script-inline",
    async generateBundle(options, bundle) {
      const contentChunk = Object.values(bundle).find(
        (c) => c.type === "chunk" && c.isEntry && c.name === "content"
      ) as Rollup.OutputChunk | undefined;
      if (!contentChunk) return;
      if (contentChunk.imports.length === 0) return;

      const contentImports = new Set(contentChunk.imports);

      const otherChunks = Object.values(bundle).filter(
        (c) => c.type === "chunk" && c.isEntry && c.name !== "content"
      ) as Rollup.OutputChunk[];

      const usedByOthers = new Set<string>();
      for (const chunk of otherChunks) {
        for (const imp of chunk.imports) {
          usedByOthers.add(imp);
        }
      }

      const toInline = [...contentImports].filter(
        (imp) => !usedByOthers.has(imp)
      );
      if (toInline.length === 0) return;

      const codeParts: string[] = [];
      for (const importPath of toInline) {
        const chunk = Object.values(bundle).find(
          (c) => c.type === "chunk" && c.fileName === importPath
        ) as Rollup.OutputChunk | undefined;
        if (!chunk) continue;
        codeParts.push(chunk.code);
        delete bundle[chunk.fileName];
      }

      contentChunk.code = codeParts.join("\n") + "\n" + contentChunk.code;

      const remaining = contentChunk.imports.filter(
        (imp) => !toInline.includes(imp)
      );
      contentChunk.imports = remaining;
    },
  };
}

export default defineConfig({
  plugins: [react(), contentScriptInline()],
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
      },
    },
  },
});
