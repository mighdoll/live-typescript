import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import recursiveImports from "rollup-plugin-recursive-imports";

export default defineConfig({
  plugins: [react(), recursiveImports(process.env.PWD)],
});
