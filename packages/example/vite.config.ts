import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import remapImports from "rollup-plugin-remap-imports";
import typeFiles from "rollup-plugin-typefiles";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    react(),
    remapImports(process.env.PWD),
    typeFiles(process.env.PWD),
  ],
});
