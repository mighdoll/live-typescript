import webgpuTypes from "/node_modules/@webgpu/types/dist/index.d.ts?raw";
import webgpuPackage from "/node_modules/@webgpu/types/package.json?raw";
import exampleUtilsJs from "/node_modules/stoneberry/dist/exampleUtils.js?raw";
import exampleUtilsMap from "/node_modules/stoneberry/dist/exampleUtils.js.map?raw";
import stoneberryPackage from "/node_modules/stoneberry/package.json?raw";
import exampleUtilsTs from "/node_modules/stoneberry/packages/examples/src/exampleUtils.ts?raw";
import thimbleberryPackage from "/node_modules/thimbleberry/package.json?raw";
import { importMapScript } from "./Imports.js";
import * as monaco_editor from "monaco-editor";
type Monaco = typeof monaco_editor;

export function stoneberryImportScript(): string {
  const utilsBlob = new Blob([exampleUtilsJs], { type: "text/javascript" });
  const utilsUrl = URL.createObjectURL(utilsBlob);

  const importScript = importMapScript(["thimbleberry", "stoneberry/scan"], {
    "stoneberry/examples": utilsUrl,
  });

  return importScript;
}

const thimbleberryTypes = import.meta.glob(
  "/node_modules/thimbleberry/**/*.d.ts",
  {
    as: "raw",
    eager: true,
  }
);

const stoneberryTypes = import.meta.glob("/node_modules/stoneberry/**/*.d.ts", {
  as: "raw",
  eager: true,
});

export function installStoneberryTypes(monaco: Monaco): void {
  addLocalTsLib(monaco, webgpuTypes, `@webgpu/types/dist/index.d.ts`);
  addLocalTsLib(monaco, webgpuPackage, `@webgpu/types/package.json`);

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    types: ["@webgpu/types"],
    moduleResolution: 100 as any, // "bundler"
    module: monaco.languages.typescript.ModuleKind.ESNext,
  });

  addLocalTsLib(monaco, thimbleberryPackage, `thimbleberry/package.json`);
  addLocalTsLib(monaco, stoneberryPackage, `stoneberry/package.json`);
  addLocalTsLib(monaco, exampleUtilsTs, `./exampleUtils.ts`);

  addTypes(monaco, thimbleberryTypes);
  addTypes(monaco, stoneberryTypes);

  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
}

function addTypes(monaco: Monaco, types: Record<string, string>) {
  for (const [path, source] of Object.entries(types)) {
    const filePath = `file://${path}`;
    addTsLib(monaco, source, filePath);
  }
}

/** add a typescript default library and set path as if from local node_modules */
function addLocalTsLib(monaco: Monaco, source: string, path?: string): void {
  const filePath = path && `file:///node_modules/${path}`;
  addTsLib(monaco, source, filePath);
}

function addTsLib(monaco: Monaco, source: string, filePath?: string): void {
  monaco.languages.typescript.typescriptDefaults.addExtraLib(source, filePath);
}
