import Editor, { useMonaco } from "@monaco-editor/react";
import { loader } from "@monaco-editor/react";

import * as monaco_editor from "monaco-editor";
import { useCallback, useEffect, useState } from "react";
import { importMapScript, transpile } from "./Transpile.js";
import "./codeExample.css";
import webgpuTypes from "/node_modules/@webgpu/types/dist/index.d.ts?raw";
import webgpuPackage from "/node_modules/@webgpu/types/package.json?raw";
import thimbleberryPackage from "/node_modules/thimbleberry/package.json?raw";
import stoneberryPackage from "/node_modules/stoneberry/package.json?raw";
import exampleUtils from "/node_modules/stoneberry/packages/examples/src/exampleUtils.ts?raw";

type Monaco = typeof monaco_editor;

// you can change the source of the monaco files
loader.config({
  paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.38.0/min/vs" },
});

const thimbleberryTypes = import.meta.glob(
  "/node_modules/thimbleberry/dist/**/*.d.ts",
  {
    as: "raw",
    eager: true,
  }
);

const stoneberryTypes = import.meta.glob(
  "/node_modules/stoneberry/dist/**/*.d.ts",
  {
    as: "raw",
    eager: true,
  }
);

interface CodeEditorProps {
  height?: number | string;
  width?: number | string;
  imports?: string[];
  code?: string;
}

const defaults: CodeEditorProps = {
  height: "400px",
  width: "700px",
  imports: ["thimbleberry", "stoneberry/scan"],
  code: "// hello world",
};

export function CodeEditor(props: CodeEditorProps): JSX.Element {
  const monaco = useMonaco();
  const { height, width, code, imports } = { ...defaults, ...props };
  const [compiledCode, setCompiledCode] = useState(transpile(code!));

  const options: monaco_editor.editor.IStandaloneEditorConstructionOptions = {
    readOnly: false,
    minimap: { enabled: false },
    lineNumbers: "off",
    fontSize: 16,
  };

  useEffect(() => {
    if (monaco) {
      initializeMonaco(monaco);
    }
  }, [monaco]);

  const codeChange = useCallback(
    (value: any) => {
      const src = value as string;
      const compiled = transpile(src);
      setCompiledCode(compiled);
    },
    [setCompiledCode]
  );

  const importScript = importMapScript(imports!);

  const html = `
    <html>
      <head>
      </head>
      <body>
        ${importScript}
        <script type="module">
          ${compiledCode}
        </script>
      </body>
    </html>
  `;

  return (
    <div className="codeContainer">
      <Editor
        {...{ height, width }}
        defaultLanguage="typescript"
        defaultValue={code}
        defaultPath="file:///index.ts"
        options={options}
        onChange={codeChange}
        theme="vs-light"
      />
      <iframe srcDoc={html} className="codeExample"></iframe>
    </div>
  );
}

function initializeMonaco(monaco: Monaco) {
  addLocalTsLib(monaco, webgpuTypes, `@webgpu/types/dist/index.d.ts`);
  addLocalTsLib(monaco, webgpuPackage, `@webgpu/types/package.json`);

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    types: ["@webgpu/types"],
    moduleResolution: 100 as any, // "bundler"
    module: monaco.languages.typescript.ModuleKind.ESNext,
  });

  addLocalTsLib(monaco, thimbleberryPackage, `thimbleberry/package.json`);
  addLocalTsLib(monaco, stoneberryPackage, `stoneberry/package.json`);
  addLocalTsLib(monaco, exampleUtils, `./exampleUtils.ts`);

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
