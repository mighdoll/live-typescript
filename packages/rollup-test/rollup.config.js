import remapImports from "rollup-plugin-remap-imports";

import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/example.ts",
  output: {
    file: "dist/example.js",
    format: "esm",
  },
  plugins: [
    typescript({
      compilerOptions: { target: "es2022", "allowImportingTsExtensions": false},
    }),
    remapImports(process.env.PWD),
  ],
};
