import recursiveImports from "rollup-plugin-recursive-imports";

import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/example.ts",
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
