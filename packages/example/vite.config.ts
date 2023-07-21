import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import remapImports from "rollup-plugin-remap-imports";

export default defineConfig({
  plugins: [react(), remapImports(process.env.PWD)],
});
