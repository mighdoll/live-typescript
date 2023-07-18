import React from "react";
// import exampleCode from "/node_modules/stoneberry-examples/src/simpleScan.ts?raw";
import { StoneberryExample } from "../src/StoneberryExample";
import "live-typescript/style.css";

export function App(): JSX.Element {
  const codeLines = example.toString().split("\n");
  const code = codeLines.slice(1, codeLines.length - 1).join("\n");
  return <StoneberryExample {...{ code }} />;
}

function example(): void {
  document.body.innerHTML = `<div> hello world!</div>`;
}
