import Editor, { useMonaco } from "@monaco-editor/react";
import * as monaco_editor from "monaco-editor";
import { useCallback, useEffect, useState } from "react";
import { importMapScript, transpile } from "./Transpile.js";
import "./codeExample.css";
import webgpuTypes from "/node_modules/@webgpu/types/dist/index.d.ts?raw";
import webgpuPackage from "/node_modules/@webgpu/types/package.json?raw";
import thimbleberryPackage from "/node_modules/thimbleberry/package.json?raw";
import stoneberryPackage from "/node_modules/stoneberry/package.json?raw";

type Monaco = typeof monaco_editor;

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
// console.log(stoneberryTypes);

interface CodeEditorProps {
  height?: number | string;
  width?: number | string;
  imports?: string[];
  code?: string;
}

const defaults: CodeEditorProps = {
  height: "400px",
  width: "500px",
  imports: ["thimbleberry"],
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
  monaco.languages.typescript.typescriptDefaults.addExtraLib(webgpuTypes);
  addLocalTsLib(monaco, webgpuTypes, `@webgpu/types/dist/index.d.ts`);
  addLocalTsLib(monaco, webgpuPackage, `@webgpu/types/package.json`);

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    types: ["@webgpu/types"],
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
  });

  addLocalTsLib(monaco, thimbleberryPackage, `thimbleberry/package.json`);
  // addTsLib(monaco, stoneberryPackage, `stoneberry/package.json`);

  addTypes(monaco, thimbleberryTypes);
  // addTypes(monaco, stoneberryTypes);

  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
}

function addTypes(monaco: Monaco, types: Record<string, string>) {
  for (const [path, source] of Object.entries(types)) {
    console.log("path:", path);
    const filePath = `file://${path}`;
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      source,
      filePath
    );
  }
}

/** add a typescript default library and set path in node modules */
function addLocalTsLib(monaco: Monaco, source: string, path?: string) {
  const filePath = path && `file:///node_modules/${path}`;
  console.log("tslib path", filePath);
  monaco.languages.typescript.typescriptDefaults.addExtraLib(source, filePath);
}
