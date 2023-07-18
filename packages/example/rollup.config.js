import recursiveImports from "../plugin/dist/rollup-plugin-recursive-imports.js";

import typescript from "@rollup/plugin-typescript";

export default {
  input: "example.ts",
  output: {
    file: "dist/example.js",
    format: "esm",
  },
  plugins: [
    recursiveImports(process.env.PWD),
    typescript({
      compilerOptions: { target: "es2022" },
    }),
  ],
};
