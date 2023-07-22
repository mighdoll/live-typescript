import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    cssCodeSplit: false,
    lib: {
      formats: ["es"],
      entry: "src/LiveTypescript.tsx",
      name: "LiveTypescript",
      fileName: "LiveTypescript",
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "monaco-editor",
        "@monaco-editor/react",
        "sucrase",
      ],
    },
  },
});
