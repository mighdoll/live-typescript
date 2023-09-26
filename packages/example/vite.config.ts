import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import sourceFiles from "rollup-plugin-sourcefiles";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    react(),
    sourceFiles(process.env.PWD, { debugImportMap: true }),
  ],
});
