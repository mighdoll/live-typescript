import React from "react";
import { ThimbleberryExample } from "./ThimbleberryExample";
import "live-typescript/style.css";

export function App(): JSX.Element {
  const codeLines = example.toString().split("\n");
  const code = codeLines.slice(1, codeLines.length - 1).join("\n");
  return <ThimbleberryExample {...{ code }} />;
}

function example(): void {
  
  document.body.innerHTML = `<div> hello world!</div>`;
}