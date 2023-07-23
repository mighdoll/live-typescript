import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import remapImports from "rollup-plugin-remap-imports";
import typeFiles from "rollup-plugin-typefiles";
import sourceFiles from "rollup-plugin-sourcefiles";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    react(),
    remapImports(process.env.PWD),
    typeFiles(process.env.PWD),
    sourceFiles(process.env.PWD),
  ],
});
