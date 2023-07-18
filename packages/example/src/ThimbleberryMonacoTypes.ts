import webgpuTypes from "../node_modules/@webgpu/types/dist/index.d.ts?raw";
import webgpuPackage from "../node_modules/@webgpu/types/package.json?raw";
import thimbleberryPackage from "../node_modules/thimbleberry/package.json?raw";
import * as monaco_editor from "monaco-editor";
type Monaco = typeof monaco_editor;

const thimbleberryTypes = import.meta.glob(
  "/node_modules/thimbleberry/**/*.d.ts",
  {
    as: "raw",
    eager: true,
  }
);


export function installStoneberryTypes(monaco: Monaco): void {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    types: ["@webgpu/types"],
    moduleResolution: 100 as any, // "bundler"
    module: monaco.languages.typescript.ModuleKind.ESNext,
  });

  addLocalTsLib(monaco, webgpuTypes, `@webgpu/types/dist/index.d.ts`);
  addLocalTsLib(monaco, webgpuPackage, `@webgpu/types/package.json`);

  addLocalTsLib(monaco, thimbleberryPackage, `thimbleberry/package.json`);

  addTypes(monaco, thimbleberryTypes);

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