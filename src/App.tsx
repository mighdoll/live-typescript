import React from "react";
import { CodeEditor } from "./CodeExample.js";
import { installStoneberryTypes } from "./StoneberryMonacoTypes.js";
import exampleCode from "/node_modules/stoneberry-examples/src/simpleScan.ts?raw";

export function App(): JSX.Element {
  const packages = ["thimbleberry", "stoneberry/scan", "stoneberry-examples"];
  return (
    <CodeEditor
      { ...{packages }}
      setupTypes={installStoneberryTypes}
      code={exampleCode}
    />
  );
}
