import remapImports from "rollup-plugin-remap-imports";
import typeFiles from "rollup-plugin-typefiles";
import sourceFiles from "rollup-plugin-sourcefiles";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/example.ts",
  output: {
    file: "dist/example.js",
    format: "esm",
  },
  plugins: [
    typescript({
      compilerOptions: { target: "es2022", allowImportingTsExtensions: false },
    }),
    remapImports(process.env.PWD),
    typeFiles(process.env.PWD),
    sourceFiles(process.env.PWD),
  ],
};
