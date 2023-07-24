import Editor, { loader, useMonaco } from "@monaco-editor/react";
import * as monaco_editor from "monaco-editor";
import { useCallback, useEffect, useState } from "react";
import { transpile } from "./Transpile.js";
import { importMapScript } from "./Imports.js";
import "./codeExample.css";

type SetupMonaco = (monaco: typeof monaco_editor) => void;

// default loader is a bit out of date, update to latest available
loader.config({
  paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.40.0/min/vs" },
});

export interface SourceFiles {
  /** map of imports bare and synthetic to code text, suitable for a browser importmap */
  importMap: Record<string, string>;

  /** map of synethic file urls to .d.ts and package.json files, suitable for monaco */
  typeFiles: Record<string, string>;
}

export interface LiveTypescriptProps {
  setupMonaco?: SetupMonaco;
  height?: number | string;
  width?: number | string;
  code?: string;
  npmPackages?: string[];
  embeddedPackages?: SourceFiles[];
  visibleTypes?: string[];
  className?: string;
}

const defaults: Partial<LiveTypescriptProps> = {
  height: "unset",
  width: "unset",
  code: "// hello world",
  npmPackages: [],
  visibleTypes: [],
  embeddedPackages: [],
};

function combineSouceFiles(array: SourceFiles[]): SourceFiles {
  const emptyMaps: SourceFiles = { importMap: {}, typeFiles: {} };
  return array.reduce((elem, combined) => {
    return {
      importMap: { ...elem.importMap, ...combined.importMap },
      typeFiles: { ...elem.typeFiles, ...combined.typeFiles },
    };
  }, emptyMaps);
}

export function LiveTypescript(props: LiveTypescriptProps): JSX.Element {
  const monaco = useMonaco();
  const settings = { ...defaults, ...props };
  const { setupMonaco, visibleTypes, height, width, code } = settings;
  const { npmPackages, embeddedPackages, className } = settings;
  const { importMap, typeFiles } = combineSouceFiles(embeddedPackages!);
  const [compiledCode, setCompiledCode] = useState(transpile(code!));

  const options: monaco_editor.editor.IStandaloneEditorConstructionOptions = {
    readOnly: false,
    minimap: { enabled: false },
    lineNumbers: "off",
    fontSize: 14,
    fontFamily:
      "'Source Code Pro', source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
    glyphMargin: false,
    folding: false,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 0,
  };

  useEffect(() => {
    if (monaco) {
      Object.entries(typeFiles!).forEach(([path, text]) => {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(text, path);
      });

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        types: visibleTypes,
        moduleResolution: 100 as any, // "bundler"
        module: monaco.languages.typescript.ModuleKind.ESNext,
      });
      monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

      setupMonaco?.(monaco);
    }
  }, [monaco, typeFiles]);

  const codeChange = useCallback(
    (value: any) => {
      const src = value as string;
      const compiled = transpile(src);
      setCompiledCode(compiled);
    },
    [setCompiledCode]
  );

  const importScript = importMapScript(npmPackages!, importMap);
  const containerClasses = `codeContainer ${className || ""}`.trim();

  const html = `
    <html>
      <head>
      <style type="text/css">
        body {
          font-family: sans-serif;
          font-size: 16px;
        }
      </style>
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
    <div className={containerClasses}>
      <Editor
        wrapperProps={{ className: "codeEditor" }}
        {...{ height, width, options }}
        defaultLanguage="typescript"
        defaultValue={code}
        defaultPath="file:///index.ts"
        onChange={codeChange}
        theme="vs-light"
      />
      <iframe srcDoc={html} className="codeExample"></iframe>
    </div>
  );
}
